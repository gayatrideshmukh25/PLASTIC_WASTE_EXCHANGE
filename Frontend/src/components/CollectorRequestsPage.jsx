import { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import StatusNote from "./StatusNote.jsx";
import useApi from "../hooks/useApi.js";
import useGo from "../hooks/useGo.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { apiGet, NETWORK_ERROR } from "../api.js";
import { toRoute } from "../utils/paths.js";

const STATUS_COLOR = { pending: "orange", accepted: "green" };

const ACTION_ERRORS = {
  accept: "Couldn't accept this request.",
  reject: "Couldn't reject this request.",
  complete: "Couldn't mark this request as completed.",
};

/**
 * The three collector screens (Dashboard / My Tasks / Completed Collections) were three copies
 * of the same page that differed only in endpoint, one column and the empty-state text.
 *
 * variant "dashboard" → shows the user's phone + the pickup date
 * variant "tasks"     → shows the user's email + the created date
 */
export default function CollectorRequestsPage({ title, endpoint, variant, emptyText }) {
  usePageTitle(`${title} | Plastic Waste Exchange`);

  const go = useGo();
  const { pathname } = useLocation();
  const { data, loading, error, refetch } = useApi(endpoint, { redirectIfFailed: "/login" });
  const [busyId, setBusyId] = useState(null);

  const requests = data?.wasteLogged ?? [];
  const isDashboard = variant === "dashboard";

  async function runAction(kind, id) {
    setBusyId(id);
    try {
      const { data: res } = await apiGet(`/api/collectorDashboard/${kind}/${id}`);
      if (!res.success) {
        alert(ACTION_ERRORS[kind]);
        return;
      }
      refetch();
      // The backend still names a page to land on; honour it unless we're already there.
      if (res.redirectTo && toRoute(res.redirectTo) !== pathname) go(res.redirectTo);
    } catch {
      alert(NETWORK_ERROR);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout role="collector" user={data?.user}>
      <section className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card" id="card">
            <h2>Waste Collection Requests</h2>

            <table id="waste-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>{isDashboard ? "Phone" : "Email"}</th>
                  <th>Waste Type</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.request_id}>
                    <td>{req.user_name}</td>
                    <td>{isDashboard ? req.user_phone : req.user_email}</td>
                    <td>{req.waste_type}</td>
                    <td>{req.user_address}</td>
                    <td>
                      <span style={{ color: STATUS_COLOR[req.status] ?? "gray", fontWeight: 600 }}>
                        {req.status}
                      </span>
                    </td>
                    <td>{(isDashboard ? req.only_date : req.created_at) || "-"}</td>
                    <td>
                      <RequestActions
                        status={req.status}
                        busy={busyId === req.request_id}
                        onAction={(kind) => runAction(kind, req.request_id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && <StatusNote>Loading…</StatusNote>}
            {error && <StatusNote variant="error">{error}</StatusNote>}
            {!loading && !error && requests.length === 0 && (
              <StatusNote variant="empty">{emptyText}</StatusNote>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function RequestActions({ status, busy, onAction }) {
  if (status === "pending") {
    return (
      <>
        <button className="btn" disabled={busy} onClick={() => onAction("accept")}>Accept</button>
        <button
          className="btn"
          disabled={busy}
          style={{ background: "red" }}
          onClick={() => onAction("reject")}
        >
          Reject
        </button>
      </>
    );
  }
  if (status === "accepted") {
    return (
      <button
        className="btn"
        disabled={busy}
        style={{ background: "green" }}
        onClick={() => onAction("complete")}
      >
        Mark Completed
      </button>
    );
  }
  if (status === "completed") {
    return <span className="btn" style={{ background: "#2ecc71" }}>Completed</span>;
  }
  if (status === "cancelled") {
    return <span className="btn" style={{ background: "gray" }}>Cancelled</span>;
  }
  return null;
}

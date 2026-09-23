import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";

const STATUS_COLOR = { pending: "orange", accepted: "green" };

export default function UserDashboard() {
  usePageTitle("Dashboard | Plastic Waste Exchange");

  const { data, loading, error } = useApi("/api/userDashboard", { redirectIfFailed: "/login" });
  const requests = data?.wasteLogged ?? [];

  return (
    <DashboardLayout role="user" user={data?.user}>
      <section className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card">
            <h2>Your Waste Requests</h2>
            <table id="waste-table">
              <thead>
                <tr>
                  <th>Waste Type</th>
                  <th>Status</th>
                  <th>Collector</th>
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.request_id ?? i}>
                    <td>{req.waste_type}</td>
                    <td style={{ fontWeight: 600, color: STATUS_COLOR[req.status] ?? "gray" }}>
                      {req.status}
                    </td>
                    <td>{req.collector_name || "Not assigned yet"}</td>
                    <td>{req.created_at || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <StatusNote>Loading…</StatusNote>}
            {error && <StatusNote variant="error">{error}</StatusNote>}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";

export default function AllUsers() {
  usePageTitle("Users | Plastic Waste Exchange");

  // The original sent non-admins to the collector dashboard; kept as is.
  const { data, loading, error } = useApi("/api/admin/users", {
    redirectIfFailed: "/collectorDashboard",
  });
  const users = data?.users ?? [];

  return (
    <DashboardLayout role="admin" user={data?.user}>
      <div className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card" id="card">
            <h2>All Users</h2>
            <ul className="people-list" id="users-list">
              {users.map((u, i) => (
                <li key={u.email ?? i}>
                  <strong>Name:</strong> {u.name} <br />
                  <strong>Email:</strong> {u.email} <br />
                  <strong>Phone:</strong> {u.phone_no} <br />
                </li>
              ))}
            </ul>
            {loading && <StatusNote>Loading…</StatusNote>}
            {error && <StatusNote variant="error">{error}</StatusNote>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

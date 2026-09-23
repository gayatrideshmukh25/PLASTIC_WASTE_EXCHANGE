import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";

export default function AllCollectors() {
  usePageTitle("Collectors | Plastic Waste Exchange");

  const { data, loading, error } = useApi("/api/admin/collectors");
  const collectors = data?.collectors ?? [];

  return (
    <DashboardLayout role="admin" user={data?.user}>
      <div className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card">
            <h2>All Collectors</h2>
            <ul className="people-list" id="collector-list">
              {collectors.map((c, i) => (
                <li key={c.email ?? i}>
                  <strong>Name:</strong> {c.name} <br />
                  <strong>Email:</strong> {c.email} <br />
                  <strong>Phone:</strong> {c.phone_no} <br />
                  <strong>Area:</strong> {c.address} <br />
                  <strong>Total Collections:</strong> {c.totalcollections} <br />
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

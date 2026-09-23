import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";

// feedback.html was an empty (0-byte) file in the original project, although the admin nav
// linked to it. This placeholder keeps that link working until the feature is built.
export default function Feedback() {
  usePageTitle("Feedback | Plastic Waste Exchange");

  const { data } = useApi("/api/adminDashboard", { redirectIfFailed: "/login" });

  return (
    <DashboardLayout role="admin" user={data?.user}>
      <div className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card">
            <h2>Feedback</h2>
            <StatusNote variant="empty">No feedback to show yet.</StatusNote>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

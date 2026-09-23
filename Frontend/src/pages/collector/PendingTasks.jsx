import CollectorRequestsPage from "../../components/CollectorRequestsPage.jsx";

export default function PendingTasks() {
  return (
    <CollectorRequestsPage
      title="My Tasks"
      endpoint="/api/collectorDashboard/pendingTasks"
      variant="tasks"
      emptyText="No Waste Request Pending"
    />
  );
}

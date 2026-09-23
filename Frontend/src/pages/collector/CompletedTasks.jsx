import CollectorRequestsPage from "../../components/CollectorRequestsPage.jsx";

export default function CompletedTasks() {
  return (
    <CollectorRequestsPage
      title="Completed Collections"
      endpoint="/api/collectorDashboard/completedTasks"
      variant="tasks"
      emptyText="No Waste Collection Completed Yet"
    />
  );
}

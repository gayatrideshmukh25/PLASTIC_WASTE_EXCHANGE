import CollectorRequestsPage from "../../components/CollectorRequestsPage.jsx";

export default function CollectorDashboard() {
  return (
    <CollectorRequestsPage
      title="Collector Dashboard"
      endpoint="/api/collectorDashboard"
      variant="dashboard"
      emptyText="No Waste Requests Yet"
    />
  );
}

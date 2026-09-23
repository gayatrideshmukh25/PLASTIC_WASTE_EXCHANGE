import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";

// Chart.js v4 is tree-shakeable: register only what these two charts use.
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

export default function AdminDashboard() {
  usePageTitle("Admin Dashboard | Plastic Waste Exchange");

  const { data, error } = useApi("/api/adminDashboard", { redirectIfFailed: "/login" });
  const monthly = data?.monthlyWaste;
  const status = data?.requestStatus;

  return (
    <DashboardLayout role="admin" user={data?.user}>
      <main className="main">
        <div className="Hcontainer">
          <div className="dashboard-grid">
            <section className="cards">
              <div className="displaycard">
                <h2 className="card-title">Total Waste Collected (kg)</h2>
                <div className="card-value" id="waste">{data?.waste}</div>
              </div>
              <div className="displaycard">
                <h2 className="card-title">Total Users Registered</h2>
                <div className="card-value" id="total_users">{data?.total_users}</div>
              </div>
              <div className="displaycard">
                <h2 className="card-title">Coupons Redeemed Today</h2>
                <div className="card-value" id="redeemed">{data?.redeemed}</div>
              </div>
            </section>

            {error && <StatusNote variant="error">{error}</StatusNote>}

            <section className="charts">
              <div className="chart-card">
                <h2>Monthly Waste Collection (kg)</h2>
                {monthly && (
                  <Bar
                    width={400}
                    height={200}
                    data={{
                      labels: monthly.months,
                      datasets: [
                        {
                          label: "Waste (kg)",
                          data: monthly.values,
                          backgroundColor: "rgba(123, 47, 242, 0.55)",
                          borderColor: "#7b2ff2",
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
                  />
                )}
              </div>

              <div className="chart-card">
                <h2>Request Status Overview</h2>
                {status && (
                  <Pie
                    width={400}
                    height={159}
                    data={{
                      labels: ["Completed", "Pending", "Accepted", "Cancelled"],
                      datasets: [
                        {
                          data: [status.completed, status.pending, status.accepted, status.cancelled],
                          // Explicit colours: Chart.js v4's defaults are near-transparent grey.
                          backgroundColor: ["#7b2ff2", "#ffa726", "#2ecc71", "#9ca3af"],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{ responsive: true }}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

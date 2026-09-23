import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import usePageTitle from "../../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../../api.js";

const EMPTY_COUPON = { title: "", description: "", pointsRequired: "", discount: "" };

export default function ManageRewards() {
  usePageTitle("Coupons | Plastic Waste Exchange");

  // The first call is only used for the logged-in admin (profile modal + auth guard), as before.
  const { data: admin } = useApi("/api/adminDashboard", { redirectIfFailed: "/login" });
  const { data: couponData, loading, error, refetch } = useApi("/api/admin/getCoupons");
  const coupons = couponData?.coupons ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function addCoupon(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiPost("/api/admin/rewards/add", form);
      setMessage(data.message || (data.success ? "Coupon added." : "Could not add coupon."));
      if (data.success) {
        setForm(EMPTY_COUPON);
        setShowForm(false);
        refetch();
      }
    } catch {
      setMessage(NETWORK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(id) {
    try {
      const { data } = await apiPost("/api/admin/rewards/delete", { id });
      if (!data.success) {
        alert("Can't delete this coupon.");
        return;
      }
      refetch();
    } catch {
      alert(NETWORK_ERROR);
    }
  }

  return (
    <DashboardLayout role="admin" user={admin?.user}>
      <main className="main">
        <div className="Hcontainer">
          <div className="dashboard-grid">
            <div className="card">
              <h2>Manage Rewards</h2>

              <button className="btn" id="showAddCouponFormBtn" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "❌" : "Add New Coupon"}
              </button>

              {showForm && (
                <form id="addCouponForm" onSubmit={addCoupon}>
                  <h3>New Coupon Details</h3>

                  <label htmlFor="title">Name:</label>
                  <input type="text" id="title" name="title" placeholder="Coupon Title" required
                    value={form.title} onChange={update("title")} />

                  <label htmlFor="description">Description:</label>
                  <input type="text" id="description" name="description" placeholder="Description" required
                    value={form.description} onChange={update("description")} />

                  <label htmlFor="pointsRequired">Points Required:</label>
                  <input type="number" id="pointsRequired" name="pointsRequired"
                    placeholder="Points Required To get This Coupon" required
                    value={form.pointsRequired} onChange={update("pointsRequired")} />

                  <label htmlFor="discount">Discount:</label>
                  <input type="number" id="discount" name="discount" placeholder="Discount want to Give" required
                    value={form.discount} onChange={update("discount")} />

                  <button type="submit" className="btn" disabled={saving}>
                    {saving ? "Adding…" : "Add Coupon"}
                  </button>
                </form>
              )}

              {message && (
                <div id="messageBoxadmin" className="alert">{message}</div>
              )}

              <h2 style={{ marginTop: "2rem" }}>Existing Coupons</h2>
              <table id="coupon-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Points Required</th>
                    <th>Discount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.points_required}</td>
                      <td>{c.discount}</td>
                      <td>
                        <button className="btn" onClick={() => deleteCoupon(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <StatusNote>Loading…</StatusNote>}
              {error && <StatusNote variant="error">{error}</StatusNote>}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

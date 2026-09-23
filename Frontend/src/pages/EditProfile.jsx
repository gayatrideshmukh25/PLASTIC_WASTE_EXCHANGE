import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import useApi from "../hooks/useApi.js";
import useGo from "../hooks/useGo.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../api.js";
import { ROLE_HOME } from "../utils/paths.js";

const EMPTY = { name: "", phone_no: "", address: "", city: "", state: "" };

export default function EditProfile() {
  usePageTitle("Edit Profile | Plastic Waste Exchange");

  const go = useGo();
  const navigate = useNavigate();
  const { data, error: loadError } = useApi("/api/getUserProfile", { redirectIfFailed: "/login" });
  const user = data?.user;
  const userType = user?.userType;

  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [saving, setSaving] = useState(false);
  const redirectTimer = useRef();

  // Fill the form once the profile arrives.
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone_no: user.phone_no || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
    });
  }, [user]);

  // Toast disappears after 5s; a pending redirect is cancelled if we leave the page.
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Regular users don't have city/state; collectors and admins do.
  const showLocationFields = userType === "collector" || userType === "admin";

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = { name: form.name, phone_no: form.phone_no, address: form.address };
    if (userType === "collector") {
      payload.city = form.city;
      payload.state = form.state;
    }

    try {
      const { data: res } = await apiPost("/api/editProfile", payload);
      if (res.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        redirectTimer.current = setTimeout(() => go(ROLE_HOME[userType] ?? "/userDashboard"), 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Failed to update profile. Please try again.",
        });
      }
    } catch {
      setMessage({ type: "error", text: NETWORK_ERROR });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      role={userType}
      user={user}
      title="Edit Profile"
      pageClass="page-request page-edit-profile"
    >
      <main>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="fa-solid fa-user" />
            </div>
            <div className="profile-info">
              <h2 id="displayName">{user?.name || "User Name"}</h2>
              <p id="displayEmail">{user?.email || "user@example.com"}</p>
            </div>
          </div>

          <form id="editForm" onSubmit={handleSubmit}>
            {(message || loadError) && (
              <div id="message" className={`msg ${message?.type ?? "error"}`}>
                {message?.text ?? loadError}
              </div>
            )}

            <div className="form-section full">
              <h3>Personal Information</h3>
            </div>

            <div>
              <label htmlFor="name">
                Full Name <span style={{ color: "#ff61a6" }}>*</span>
              </label>
              <input type="text" id="name" name="name" placeholder="Enter your full name" required
                value={form.name} onChange={update("name")} />
            </div>

            <div>
              <label htmlFor="phone_no">Phone Number</label>
              <input type="tel" id="phone_no" name="phone_no" placeholder="Enter your phone number"
                value={form.phone_no} onChange={update("phone_no")} />
            </div>

            <div className="full">
              <label htmlFor="email">
                Email Address <span style={{ color: "#999" }}>(Cannot change)</span>
              </label>
              <input type="email" id="email" name="email" placeholder="Your email" disabled
                value={user?.email || ""} readOnly />
            </div>

            <div className="full">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" placeholder="Enter your complete address"
                value={form.address} onChange={update("address")} />
            </div>

            {showLocationFields && (
              <>
                <div>
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" name="city" placeholder="City"
                    value={form.city} onChange={update("city")} />
                </div>
                <div>
                  <label htmlFor="state">State</label>
                  <input type="text" id="state" name="state" placeholder="State/Province"
                    value={form.state} onChange={update("state")} />
                </div>
              </>
            )}

            <div className="full actions">
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}

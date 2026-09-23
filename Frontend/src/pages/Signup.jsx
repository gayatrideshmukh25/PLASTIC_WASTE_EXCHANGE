import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import useGo from "../hooks/useGo.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../api.js";

// Field names are the ones the backend validates (note the original spelling of `availablity`).
const INITIAL = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  phone_no: "",
  userType: "",
  city: "",
  state: "",
  pincode: "",
  availablity: "available",
};

// Turns the address into coordinates (OpenStreetMap Nominatim) so collectors can be matched by distance.
async function geocode(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
    );
    const results = await res.json();
    if (results.length > 0) return { latitude: results[0].lat, longitude: results[0].lon };
  } catch {
    /* treated the same as "not found" */
  }
  return null;
}

export default function Signup() {
  usePageTitle("Signup - Plastic Waste Exchange");

  const go = useGo();
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectTimer = useRef();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const error = (field) => <div className="error">{fieldErrors[field]}</div>;

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const coords = await geocode(form.address);
      if (!coords) alert("Address not found!");

      const { ok, data } = await apiPost("/api/signup", {
        ...form,
        latitude: coords?.latitude ?? "",
        longitude: coords?.longitude ?? "",
      });

      if (!ok) {
        // { errors: { field: { msg } }, oldInput: { field: value }, message }
        const errors = {};
        for (const [field, detail] of Object.entries(data.errors ?? {})) errors[field] = detail.msg;
        setFieldErrors(errors);

        // Restore what the server echoed back (only fields this form actually has).
        const restored = Object.fromEntries(
          Object.entries(data.oldInput ?? {}).filter(([field]) => field in INITIAL),
        );
        setForm((f) => ({ ...f, ...restored }));

        setFormError(data.message || "Signup failed. Please check the errors above.");
        return;
      }

      setSuccess("Signup successful!");
      setForm(INITIAL);
      redirectTimer.current = setTimeout(() => go("/login"), 1500);
    } catch {
      setFormError(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout pageClass="page-auth" logoSize={38}>
      <div className="authcontainer">
        <h2>Signup</h2>
        <form id="signupForm" onSubmit={handleSubmit}>
          <input type="text" name="name" id="name" placeholder="Name" required
            value={form.name} onChange={update("name")} />
          {error("name")}

          <input type="email" name="email" id="email" placeholder="Email" required
            value={form.email} onChange={update("email")} />
          {error("email")}

          <input type="password" name="password" id="password" placeholder="Password" required
            value={form.password} onChange={update("password")} />
          {error("password")}

          <input type="password" name="confirmPassword" id="confirmPassword"
            placeholder="Confirm Password" required
            value={form.confirmPassword} onChange={update("confirmPassword")} />
          {error("confirmPassword")}

          <label htmlFor="address">Address</label>
          <textarea id="address" name="address" placeholder="Enter Your Location to exchange" required
            value={form.address} onChange={update("address")} />
          {error("address")}

          <input type="tel" name="phone_no" id="phone_no" placeholder="Phone Number" required
            value={form.phone_no} onChange={update("phone_no")} />
          {error("phone_no")}

          <select name="userType" id="userType" required value={form.userType} onChange={update("userType")}>
            <option value="" disabled>Select User Type</option>
            <option value="user">User</option>
            <option value="collector">Collector</option>
          </select>
          {error("userType")}

          {form.userType === "collector" && (
            <div id="collectorFields">
              <input type="text" name="city" id="city" placeholder="City"
                value={form.city} onChange={update("city")} />
              {error("city")}

              <input type="text" name="state" id="state" placeholder="State"
                value={form.state} onChange={update("state")} />
              {error("state")}

              <input type="text" name="pincode" id="pincode" placeholder="Pincode"
                value={form.pincode} onChange={update("pincode")} />
              {error("pincode")}

              <select name="availablity" id="availability"
                value={form.availablity} onChange={update("availablity")}>
                <option value="available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
              {error("availablity")}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Signing up…" : "Signup"}
          </button>
        </form>

        <p id="signupError" className="error">{formError}</p>
        <p id="signupSuccess" className="success">{success}</p>

        <div className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

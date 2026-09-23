import { useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import useGo from "../hooks/useGo.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../api.js";
import { ROLE_HOME } from "../utils/paths.js";

export default function Login() {
  usePageTitle("Login - Plastic Waste Exchange");

  const go = useGo();
  const [form, setForm] = useState({ email: "", password: "", userType: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await apiPost("/api/login", form);
      if (!data.success) {
        setError(data.errorMessage || "Login failed");
        return;
      }
      go(data.redirectTo, ROLE_HOME[form.userType]);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout pageClass="page-auth" cta="signup" textHome logoSize={38}>
      <div className="authcontainer">
        <h2>Login</h2>
        <form id="loginForm" className="active" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={update("email")}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={update("password")}
          />
          <select name="userType" required value={form.userType} onChange={update("userType")}>
            <option value="" disabled>Select User Type</option>
            <option value="user">User</option>
            <option value="collector">Collector</option>
            <option value="admin">admin</option>
          </select>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Logging in…" : "Login"}
          </button>
          <p id="loginError" className="error">{error}</p>
        </form>
        <div className="form-footer">
          Don't have an account? <Link to="/signup" id="toSignup">Signup</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

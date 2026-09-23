import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";
import { apiGet, NETWORK_ERROR } from "../api.js";
import useGo from "../hooks/useGo.js";

// One nav per role – replaces the header that was copy-pasted into every dashboard page.
const NAV = {
  user: [
    ["/userDashboard", "Dashboard"],
    ["/request", "Send Waste Request"],
    ["/rewards", "Rewards"],
  ],
  collector: [
    ["/collectorDashboard", "Dashboard"],
    ["/pendingTasks", "My Tasks"],
    ["/completedTasks", "Completed Collections"],
  ],
  admin: [
    ["/adminDashboard", "Dashboard"],
    ["/allUsers", "Users"],
    ["/allCollectors", "Collectors"],
    ["/manageRewards", "Coupons"],
    ["/feedback", "Feedback"],
  ],
};

const TITLES = {
  user: "UserDashboard",
  collector: "CollectorDashboard",
  admin: "AdminDashboard",
};

/**
 * Header (logo, role nav, profile modal with logout) + footer for logged-in pages.
 *
 * role       "user" | "collector" | "admin"  (undefined = no nav links yet)
 * user       { name, email, userType } from the page's own API response (shown in the modal)
 * title      overrides the default heading (e.g. "Edit Profile")
 * pageClass  wrapper class(es) used to scope page-specific CSS
 */
export default function DashboardLayout({ role, user, title, pageClass, children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const go = useGo();

  // Escape closes the modal.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  async function logout() {
    try {
      const { data } = await apiGet("/api/logout");
      if (!data.success) {
        alert("Can't log out right now. Please try again.");
        return;
      }
      go(data.redirectTo, "/login");
    } catch {
      alert(NETWORK_ERROR);
    }
  }

  return (
    <div className={pageClass}>
      <header>
        <h1>
          <img src="/images/image.png" alt="Recycle" width="50" />
          {title ?? TITLES[role]}
        </h1>

        <nav>
          {(NAV[role] ?? []).map(([to, label]) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
          <span
            id="profile-shortcut"
            role="button"
            tabIndex={0}
            title="Quick Profile"
            aria-label="Open profile"
            onClick={() => setModalOpen(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setModalOpen(true)}
          >
            <i
              className="fa-solid fa-user-circle"
              style={{ fontSize: "1.8rem", color: "#7b2ff2", verticalAlign: "middle" }}
            />
          </span>
        </nav>

        {/* Overlay: click outside the box to close, like the original */}
        <div
          id="profile-modal"
          className="profile-modal"
          style={{ display: modalOpen ? "flex" : "none" }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="profile-content">
            <span id="close-modal" className="close" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            {role === "user" && <h2>User Profile</h2>}
            {user && (
              <>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>User Type: {user.userType}</p>
              </>
            )}
            <Link to="/editProfile" className="btn">Edit Profile</Link>
            <button type="button" className="btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      {children}
      <Footer />
    </div>
  );
}

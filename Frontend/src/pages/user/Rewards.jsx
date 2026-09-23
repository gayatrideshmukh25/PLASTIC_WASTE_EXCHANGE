import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import StatusNote from "../../components/StatusNote.jsx";
import useApi from "../../hooks/useApi.js";
import useGo from "../../hooks/useGo.js";
import usePageTitle from "../../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../../api.js";

export default function Rewards() {
  usePageTitle("Rewards | Plastic Waste Exchange");

  const go = useGo();
  const { data, error, refetch } = useApi("/api/userDashboard/rewards", {
    redirectIfFailed: "/userDashboard",
  });
  const [message, setMessage] = useState(null); // { ok, text }

  const user = data?.user;
  const coupons = data?.coupons ?? [];
  const redeemed = data?.userCoupons ?? [];

  async function redeem(couponId) {
    try {
      const { data: res } = await apiPost("/api/userDashboard/rewards/redeem", {
        coupon_id: couponId,
      });
      setMessage({
        ok: !!res.success,
        text: res.message || (res.success ? "Coupon redeemed!" : "Failed to redeem coupon."),
      });
      if (res.success) refetch(); // refresh points + both coupon lists (the old page did a full reload)
    } catch {
      setMessage({ ok: false, text: NETWORK_ERROR });
    }
  }

  return (
    <DashboardLayout role="user" user={user} pageClass="page-rewards">
      <div className="Hcontainer">
        <div className="dashboard-grid">
          <div className="card">
            <h2>🎁 Rewards &amp; Coupons</h2>

            <div className="points-box">
              <div>Your Reward Points</div>
              <div className="points-number" id="rewardPoints">{user?.reward_points}</div>
            </div>

            <h3 style={{ marginTop: "0.6rem", color: "#7b2ff2" }}>⭐ Available Coupons</h3>
            <div className="coupon-list" id="availableCoupons">
              {data && coupons.length === 0 && (
                <div className="coupon-card">No coupons available currently.</div>
              )}
              {coupons.map((c) => (
                <div className="coupon-card" key={c.id}>
                  <b>{c.title}</b>
                  <div className="coupon-meta">{c.description}</div>
                  <div className="coupon-meta">
                    Points Required: <strong>{c.points_required}</strong>
                  </div>
                  <div className="coupon-footer">
                    <button className="btn" onClick={() => redeem(c.id)}>Redeem</button>
                    <small className="coupon-meta">Valid while stocks last</small>
                  </div>
                </div>
              ))}
            </div>

            {message && (
              <div className="alert" style={{ background: message.ok ? "#e6ffed" : "#ffe6e6" }}>
                {message.text}
              </div>
            )}

            <h3 style={{ marginTop: "1rem", color: "#7b2ff2" }}>Your Redeemed Coupons</h3>
            <div className="redeemed-list" id="redeemedCoupons">
              {data && redeemed.length === 0 && (
                <div className="coupon-card">No coupons redeemed yet.</div>
              )}
              {redeemed.map((uc) => (
                <div className="redeemed-card" key={uc.code}>
                  <div className="redeemed-left">
                    <b>{uc.title}</b>
                    <div className="coupon-meta">{uc.description}</div>
                    <div className="coupon-meta">
                      Code: <span className="redeemed-code">{uc.code}</span>
                    </div>
                    <span className={`status-badge ${uc.status === "active" ? "active" : "used"}`}>
                      {uc.status}
                    </span>
                  </div>
                  <div>
                    {uc.status === "active" ? (
                      <button className="btn btn-get" onClick={() => go("/products")}>
                        Use Coupon
                      </button>
                    ) : (
                      <div style={{ color: "#5e548e", fontWeight: 600 }}>No actions</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && <StatusNote variant="error">{error}</StatusNote>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

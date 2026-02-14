const shortcut = document.getElementById("profile-shortcut");
const modal = document.getElementById("profile-modal");
const closeBtn = document.getElementById("close-modal");

shortcut.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
fetch("http://localhost:3000/api/userDashboard/rewards", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    if (!data.success) {
      window.location.href = "userDashboard.html";
      return;
    }

    const user = data.user;
    const coupons = data.coupons;
    const redeemed = data.userCoupons; // FIXED

    document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById(
      "userType"
    ).innerText = `User Type: ${user.userType}`;

    document.getElementById("rewardPoints").innerText = `${user.reward_points}`;

    // AVAILABLE COUPONS
    const couponDiv = document.getElementById("availableCoupons");
    couponDiv.innerHTML = "";

    if (!coupons.length) {
      couponDiv.innerHTML = `<div class="coupon-card">No coupons available currently.</div>`;
    } else {
      coupons.forEach((c) => {
        couponDiv.innerHTML += `
          <div class="coupon-card">
            <b>${c.title}</b>
            <div class="coupon-meta">${c.description}</div>
            <div class="coupon-meta">Points Required: <strong>${c.points_required}</strong></div>
            <div class="coupon-footer">
              <button class="btn" onclick="redeemCoupon(${c.id})">Redeem</button>
              <small class="coupon-meta">Valid while stocks last</small>
            </div>
          </div>
        `;
      });
    }

    // REDEEMED COUPONS
    const redeemedDiv = document.getElementById("redeemedCoupons");
    redeemedDiv.innerHTML = "";

    if (!redeemed.length) {
      redeemedDiv.innerHTML = `<div class="coupon-card">No coupons redeemed yet.</div>`;
    } else {
      redeemed.forEach((uc) => {
        redeemedDiv.innerHTML += `
          <div class="redeemed-card">
            <div class="redeemed-left">
              <b>${uc.title}</b>
              <div class="coupon-meta">${uc.description}</div>
              <div class="coupon-meta">Code: <span class="redeemed-code">${
                uc.code
              }</span></div>
              <span class="status-badge ${
                uc.status === "active" ? "active" : "used"
              }">${uc.status}</span>
            </div>

            <div>
              ${
                uc.status === "active"
                  ? `<button class="btn btn-get" onclick="useCoupon('${uc.code}')">Use Coupon</button>`
                  : `<div style="color:#5e548e; font-weight:600;">No actions</div>`
              }
            </div>
          </div>
        `;
      });
    }
  });

// -------------------- REDEEM FUNCTION FIXED --------------------

async function redeemCoupon(id) {
  const res = await fetch(
    "http://localhost:3000/api/userDashboard/rewards/redeem",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ coupon_id: id }),
    }
  );

  const data = await res.json();
  const messageBox = document.getElementById("messageBox");

  messageBox.style.display = "block"; // SHOW THE BOX

  if (data.success) {
    window.location.href = "rewards.html";
    messageBox.innerHTML = `<div class="alert" style="background:#e6ffed;">${data.message}</div>`;
  } else {
    messageBox.innerHTML = `<div class="alert" style="background:#ffe6e6;">${
      data.message || "Failed to redeem coupon."
    }</div>`;
  }
}

// LOGOUT
document.getElementById("logout").addEventListener("click", async () => {
  fetch("http://localhost:3000/api/logout", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert("Cant Logout");
        return;
      }
      window.location.href = data.redirectTo;
    });
});
function useCoupon(id) {
  window.location.href = "products.html";
}

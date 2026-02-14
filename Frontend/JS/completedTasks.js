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
fetch("http://localhost:3000/api/collectorDashboard/completedTasks", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    if (!data.success) {
      window.location.href = "/login.html";
      return;
    }
    console.log("data", data);
    const user = data.user;
    const wasteLogged = data.wasteLogged;
    document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById(
      "userType"
    ).innerText = `User Type: ${user.userType}`;

    // Fill Waste Table
    const table = document.getElementById("waste-table");
    const card = document.getElementById("card");
    //  const tableBody = document.querySelector("#wasteTable tbody");
    if (!wasteLogged) {
      const p = document.createElement("p");
      p.innerText = "No Waste Collection Completed Yet ";
      p.style.fontSize = "1.2rem";
      p.style.fontWeight = "600";
      p.style.color = "gray";
      card.appendChild(p);
      return;
    }
    if (Array.isArray(wasteLogged) && wasteLogged.length === 0) {
      const p = document.createElement("p");
      p.innerText = "No Waste Collection Completed Yet";
      p.style.color = "gray";
      p.style.fontSize = "1.2rem";
      p.style.fontWeight = "600";
      card.appendChild(p);
      return;
    }
    wasteLogged.forEach((req) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.user_name}</td>
        <td>${req.user_email}</td>
        <td>${req.waste_type}</td>
        <td>${req.user_address}</td>
        <td>
            ${
              req.status === "pending"
                ? `<span style="color: orange; font-weight: 600;">${req.status}</span>`
                : req.status === "accepted"
                ? `<span style="color: green; font-weight: 600;">${req.status}</span>`
                : `<span style="color: gray; font-weight: 600;">${req.status}</span>`
            }
        </td>
        <td>${req.created_at || "-"}</td>
        <td>
            ${
              req.status === "pending"
                ? `
                    <button onclick="acceptRequest(${req.request_id})" class="btn">Accept</button>
                    <button onclick="rejectRequest(${req.request_id})" class="btn" style="background:red;">Reject</button>
                  `
                : req.status === "accepted"
                ? `<button onclick="completeRequest(${req.request_id})" class="btn" style="background:green;">Mark Completed</button>`
                : `<span class="btn" style="background:#2ecc71;">Completed</span>`
            }
        </td>
    `;

      table.appendChild(row);
    });
  });
async function acceptRequest(request_id) {
  fetch(`/api/collectorDashboard/accept/${request_id}`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert("Cant Accept");
        return;
      }
      window.location.href = data.redirectTo;
    });
}

async function rejectRequest(request_id) {
  fetch(`/api/collectorDashboard/reject/${request_id}`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert("Cant Accept");
        return;
      }
      window.location.href = data.redirectTo;
    });
}

async function completeRequest(request_id) {
  fetch(`/api/collectorDashboard/complete/${request_id}`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert("Cant Accept");
        return;
      }
      window.location.href = data.redirectTo;
    });
}

document.getElementById("logout").addEventListener("click", async () => {
  fetch("http://localhost:3000/api/logout", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert("Cant Logout");
        return;
      }
      window.location.href = data.redirectTo;
    });
});

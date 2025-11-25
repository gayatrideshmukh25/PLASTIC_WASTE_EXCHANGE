const shortcut = document.getElementById('profile-shortcut');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('close-modal');


    shortcut.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close when clicking outside content
    window.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.style.display = 'none';
        }
    });
// Fetch dashboard details

 fetch("http://localhost:3000/api/userDashboard", {
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {

    if (!data.success) {
      window.location.href = "/login.html";
      return;
    }

    const user = data.user;
    const waste = data.wasteLogged;
    document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById("userType").innerText = `User Type: ${user.userType}`;
   
    const table = document.getElementById("waste-table");

    waste.forEach(req => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.waste_type}</td>
        <td style="font-weight:600; color:${req.status === 'pending' ? 'orange' : req.status === 'accepted' ? 'green' : 'gray'}">
          ${req.status}
        </td>
        <td>${req.collector_name || "Not assigned yet"}</td>
        <td>${req.created_at || "-"}</td>
      `;
      table.appendChild(row);
    });

  });

 document.getElementById('logout').addEventListener('click',async() => {
 fetch("http://localhost:3000/api/logout", {
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {

    if (!data.success) {
      alert('Cant Logout')
      return;
    }
    window.location.href = data.redirectTo;
  });   
 });
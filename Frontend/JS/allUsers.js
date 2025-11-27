const shortcut = document.getElementById('profile-shortcut');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('close-modal');

    // Show modal when clicking shortcut
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
   fetch("http://localhost:3000/api/admin/users", {
  credentials: "include"
})
      .then(res => res.json())
      .then(data => {
        const user = data.user;
        const users = data.users;
        console.log("Aadmin",user)
         document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById("userType").innerText = `User Type: ${user.userType}`;
       if(!data.success){
          window.location.href = "/collectorDashboard.html";
          return;
       }
        const list = document.getElementById('users-list');

      // Clear existing content
      list.innerHTML = '';

      data.users.forEach(c => {
          // Create a list item
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>Name:</strong> ${c.name} <br>
            <strong>Email:</strong> ${c.email} <br>
            <strong>Phone:</strong> ${c.phone_no} <br>
           
   
          `;
          list.appendChild(li);
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
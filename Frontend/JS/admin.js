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
    
 
  fetch("http://localhost:3000/api/adminDashboard", {
         credentials: "include"
     })
     .then(res => res.json())
     .then(data => {
       if (!data.success) {
         window.location.href = "/login.html";
         return;
       }
       
       const user = data.user;
       const users = data.userResults
       const collectors = data.collectors
       const waste = data.waste
       const total_users= data.total_users
      const redeemed = data.redeemed
         document.getElementById('waste').innerText = waste;
         document.getElementById('total_users').innerText = total_users;
         document.getElementById('redeemed').innerText = redeemed;

       document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById("userType").innerText = `User Type: ${user.userType}`;
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
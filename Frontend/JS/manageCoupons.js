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
    
         

    document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById("userType").innerText = `User Type: ${user.userType}`;
     });
    const couponTable =  document.getElementById("coupon-table");
    
    fetch('http://localhost:3000/api/admin/getCoupons')
    .then(response => response.json())
    .then(data => {
        const coupons = data.coupons;
        coupons.forEach(coupon => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${coupon.title}</td>
                <td>${coupon.description}</td>
                <td>${coupon.points_required}</td>
                <td>${coupon.discount}</td>
                <td><button onclick="deleteCoupon(${coupon.id})" class="btn">Delete</button></td>
            `;
            couponTable.querySelector("tbody").appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching coupons:', error));

      document.getElementById("showAddCouponFormBtn").onclick = function () {
        const form = document.getElementById("addCouponForm");

        if (form.style.display === "none") {
            form.style.display = "block";
            this.textContent = "❌";
        } else {
            form.style.display = "none";
            this.textContent = "+ Add Reward";
        }
    };

    document.getElementById("addCouponForm").addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const pointsRequired = document.getElementById("pointsRequired").value;
        const discount = document.getElementById("discount").value;
        
        const response = await fetch('http://localhost:3000/api/admin/rewards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, pointsRequired,discount })
        });

        const data = await response.json();
        if (data.success) {
            const messageBox = document.getElementById("messageBox");
            messageBox.style.display = "block";
            messageBox.textContent = data.message; 
            document.getElementById("addCouponForm").reset();
            document.getElementById("addCouponForm").style.display = "none";
            document.getElementById("showAddCouponFormBtn").textContent = "+ Add Reward";
            window.location.reload();
        } else {
            const messageBox = document.getElementById("messageBox");
            messageBox.style.display = "block";
            messageBox.textContent = data.message; 
        }
    });
    function deleteCoupon(id) {
        fetch('http://localhost:3000/api/admin/rewards/delete',{
        method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
    })
     .then(response => response.json())
    .then(data => {
        if(!data.success){
            alert("cant delete")
        }else{
           window.location.reload();
        }
    })

}
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
})
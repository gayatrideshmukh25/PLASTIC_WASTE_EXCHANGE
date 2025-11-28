
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
    fetch('http://localhost:3000/api/userDashboard/sendRequest',{
      credentials: "include"
    })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      window.location.href = "/login.html";
      return;
    }
    console.log("data",data);
    const user = data.user;
    document.getElementById("name").innerText = `Name: ${user.name}`;
    document.getElementById("email").innerText = `Email: ${user.email}`;
    document.getElementById("userType").innerText = `User Type: ${user.userType}`;
    document.getElementById("user_id").value = user._id;
    });
     document.getElementById('findLocationBtn').addEventListener('click', () => {
      const locationStatus = document.getElementById('locationStatus');
      const nearestDiv = document.getElementById('nearestCollector');
      locationStatus.textContent = "Fetching your location...";

      if (navigator.geolocation) {
        console.log('fetching')
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        locationStatus.textContent = "Geolocation not supported.";
      }

      function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        locationStatus.textContent = `Your location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        fetch(`/api/userDashboard/nearestCollector?lat=${latitude}&lng=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.name) {
              nearestDiv.innerHTML = `
                <h3>Nearest Collector Found:</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Address:</strong> ${data.address}</p>
                <p><strong>Distance:</strong> ${data.distance} km</p>
              `;
              document.getElementById("collectorId").value = data.id;
            } else {
              nearestDiv.textContent = data.message || "No nearby collectors found.";
            }
          })
          .catch(() => {
            locationStatus.textContent = "Failed to fetch nearest collector.";
          });
      }

      function error(err) {
        console.log(err);
        locationStatus.textContent = "Unable to retrieve your location.";
      }
    });

    document.getElementById('wasteForm').addEventListener('submit', async (e) => {
     e.preventDefault();
    
    const  collector_id = document.querySelector("input[name='collector_id']").value;
    const  waste_type = document.querySelector("select[name='waste_type']").value;
    const quantity = document.querySelector("input[name='quantity']").value;
    const pickup_address = document.querySelector("textarea[name='pickup_address']").value;
    const preferred_date = document.querySelector("input[name='preferred_date']").value;
    const preferred_time = document.querySelector("input[name='preferred_time']").value;
    const notes =document.querySelector("textarea[name='notes']").value;

    const res = await  fetch('http://localhost:3000/api/userDashboard/postRequest',{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collector_id, waste_type, quantity,
    pickup_address,
    preferred_date, preferred_time, notes }),
    })
   
    const data = await res.json();
    console.log("data",data);
    
    if (!data.success) {
      console.log(data.success);
      alert(data.message || "Request Submission Failed");
      return;

    }
    console.log(data.success);
    console.log("Redirecting to:", data.redirectTo);
    window.location.href = data.redirectTo;

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

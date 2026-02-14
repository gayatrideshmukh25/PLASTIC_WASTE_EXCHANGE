// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition((pos) => {
//       document.getElementById("latitude").value = pos.coords.latitude;
//       document.getElementById("longitude").value = pos.coords.longitude;
//     });
//   }
//   const userTypeSelect = document.getElementById('userType');
//   const collectorFields = document.getElementById('collectorFields');

//   userTypeSelect.addEventListener('change', () => {
//     if (userTypeSelect.value === 'collector') {
//       collectorFields.style.display = 'block';  // show extra fields
//     } else {
//       collectorFields.style.display = 'none';   // hide extra fields
//     }
//   });

const userType = document.getElementById("userType");
const collectorFields = document.getElementById("collectorFields");
userType.addEventListener("change", () => {
  collectorFields.style.display =
    userType.value === "collector" ? "block" : "none";
});

const form = document.getElementById("signupForm");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

signupError.textContent = "";
signupSuccess.textContent = "";

const errorFields = document.querySelectorAll(".error");
errorFields.forEach((el) => (el.textContent = ""));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const address = document.getElementById("address").value;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  const response = await fetch(url);
  const result = await response.json();

  if (result.length > 0) {
    document.getElementById("latitude").value = result[0].lat;
    document.getElementById("longitude").value = result[0].lon;
  } else {
    alert("Address not found!");
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      for (let field in result.errors) {
        const fieldErrorEl = document.getElementById(field + "Error");
        if (fieldErrorEl) fieldErrorEl.textContent = result.errors[field].msg;
      }

      for (let field in result.oldInput) {
        const input = document.getElementById(field);
        if (input) {
          input.value = result.oldInput[field];
        }
      }
      signupError.textContent =
        result.message || "Signup failed. Please check the errors above.";
    } else {
      signupSuccess.textContent = "Signup successful!";
      form.reset();
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    signupError.textContent = "Something went wrong. Please try again.";
  }
});

document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("cliked");
  const email = document.querySelector("input[name='email']").value;
  const password = document.querySelector("input[name='password']").value;
  const userType = document.querySelector("select[name='userType']").value;

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userType }),
  });

  const data = await res.json();
  console.log("data", data);
  if (!data.success) {
    const loginError = document.getElementById("loginError");
    loginError.textContent = data.errorMessage || "Login failed";

    return;
  }

  window.location.href = data.redirectTo;
});

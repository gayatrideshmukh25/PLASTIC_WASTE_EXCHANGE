const userType = document.getElementById("userType");
        const collectorFields = document.getElementById("collectorFields");
        userType.addEventListener("change", () => {
            collectorFields.style.display = userType.value === "collector" ? "block" : "none";
        });

        
        const form = document.getElementById("signupForm");
        const signupError = document.getElementById("signupError");
        const signupSuccess = document.getElementById("signupSuccess");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            signupError.textContent = "";
            signupSuccess.textContent = "";

            
            const errorFields = document.querySelectorAll(".error");
            errorFields.forEach(el => el.textContent = "");

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch("http://localhost:3000/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
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
                 signupError.textContent = result.message || "Signup failed. Please check the errors above.";

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
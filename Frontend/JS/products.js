
 console.log("Fetching products...");
    fetch("http://localhost:3000/api/products", {
    method: "GET",
    credentials: "include"
})
.then(res => res.json())
.then(data => {
   const productsContainer = document.getElementById("products");
   productsContainer.innerHTML = "";

  data.products.forEach(p => {
 const card = document.createElement("div");
 card.classList.add("product-card");

     card.innerHTML = `
            <img src="${p.image}" />
             <h3>${p.name}</h3>
            <p>${p.description}</p>
          <p><b>Price:</b> ₹${p.price}</p>

       <form class="coupon-form">
       <input type="hidden" name="product_id" value="${p.id}">
        <input type="hidden" name="price" value="${p.price}">
        <input type="text" name="coupon_code" placeholder="Enter coupon code">
        <button type="submit">Apply Coupon</button>
        </form>
           <p>
               <b>Original Price:</b> <span id="original-price-${p.id}">₹${p.price.toFixed(2)}</span>
           </p>

          <div id="discount-details-${p.id}" style="margin: 5px 0;"></div>
          <div id="messageBox-${p.id}" class="alert" style="display:block"></div>
            
          <form class="buy-form">
            <input type="hidden" name="product_id" >
            <input type="hidden" name="final_price" id="final_price-${p.id}">
            <input type="hidden" name='discount' id="discount-${p.id}">
            <input type="hidden" name='originalPrice' id="originalPrice-${p.id}">
            <input type="hidden" name='amountSaved' id="amountSaved-${p.id}">
               <button type="submit">Buy Now</button>
          </form>
`;

            productsContainer.appendChild(card);
            const buyForm = card.querySelector(".buy-form");
buyForm.querySelector("input[name='product_id']").value = p.id; // <-- This is correct for setting product_id
buyForm.querySelector("input[name='originalPrice']").value = p.price;
buyForm.querySelector("input[name='final_price']").value = p.price;
buyForm.querySelector("input[name='discount']").value = 0;
buyForm.querySelector("input[name='amountSaved']").value = 0;
});

    setupCouponListeners(); 
    setupBuyNowListeners();
});


// ⭐ FIX 2 & 3: Functional and Secure Event Listener Setup

function setupCouponListeners() {
    // Select all coupon forms using the new class
    const applyForms = document.querySelectorAll('.coupon-form');

    applyForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // CRITICAL FIX: Scope the selection to the submitted form (e.currentTarget)
            const product_id = e.currentTarget.querySelector('input[name="product_id"]').value;
            const price = e.currentTarget.querySelector('input[name="price"]').value;
            const coupon_code = e.currentTarget.querySelector('input[name="coupon_code"]').value;

            const res = await fetch("http://localhost:3000/api/userDashboard/apply-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id, price, coupon_code }),
                credentials: "include"
            });

            console.log("Applying coupon...");
            const data = await res.json();
            console.log(data);
            const originalPrice = data.originalPrice;
            const finalPrice = Number(data.finalPrice) || originalPrice;;
            const discount = data.discount;

            console.log("discount",discount)
            const discountDetailsArea = document.getElementById(`discount-details-${product_id}`);
            const originalPriceDisplay = document.getElementById(`original-price-${product_id}`);

            if (data.success ) {
              const discountDetailsArea = document.getElementById(`discount-details-${product_id}`);
             const originalPriceDisplay = document.getElementById(`original-price-${product_id}`);
    
              const amountSaved = (Number(originalPrice) - Number(finalPrice));

   
         discountDetailsArea.innerHTML = `
        <p style="color: #28a745; margin-bottom: 3px;">
            Discount Applied: <b>${discount}%</b> (You Save: ₹${amountSaved})
        </p>
        <p>
            <b>Final Price:</b> <b style="color: #7b2ff2; font-size: 1.2em;">₹${finalPrice}</b>
        </p>
    `;
    originalPriceDisplay.innerHTML = `<s style="color: grey;">₹${originalPrice}</s>`;
     console.log(Number(discount));
    

const discountToWrite = String(Number(discount));
const amountSavedToWrite = String(Number(amountSaved).toFixed(2));
const finalPriceToWrite = String(Number(finalPrice));
const originalPriceToWrite = String(Number(originalPrice));

// 1. Target the Hidden Inputs using their unique IDs
const discountInput = document.getElementById(`discount-${product_id}`);
const finalPriceInput = document.getElementById(`final_price-${product_id}`);
const amountSavedInput = document.getElementById(`amountSaved-${product_id}`);
const originalPriceInput = document.getElementById(`originalPrice-${product_id}`);



if (!discountInput || !finalPriceInput) {
    
    console.error(`[CRITICAL ERROR] Product ID ${product_id}: Cannot find ALL hidden inputs.`);
    console.error(`Missing Discount Input: ${!discountInput}`);
   
}


// 3. Write the values


discountInput.value = discountToWrite;
finalPriceInput.value = finalPriceToWrite;
originalPriceInput.value = originalPriceToWrite; 
amountSavedInput.value = amountSavedToWrite;

const messageBox = document.getElementById(`messageBox-${product_id}`);
    messageBox.style.display = "block";
    messageBox.style.color = "green";
    messageBox.innerText = `Coupon applied! You saved ${discount}%`;
} else {
    alert(data.message || "Failed to apply coupon");
}
        });
    });
}


function setupBuyNowListeners() {
    const buyForms = document.querySelectorAll('.buy-form');

    buyForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            console.log("Initiating checkout...");

            try {
                const buyForm = e.currentTarget;

                
                let productId = buyForm.querySelector("input[name='product_id']").value;

             
                let originalPrice = Number(document.getElementById(`originalPrice-${productId}`).value);
                let finalPrice = Number(document.getElementById(`final_price-${productId}`).value);
                let discount = Number(document.getElementById(`discount-${productId}`).value);
                let amountSaved = Number(document.getElementById(`amountSaved-${productId}`).value);

                // Log the final values read from the form *before* sending them
                console.log("Data read from Buy Form (Final Check):", { productId, finalPrice, discount, originalPrice, amountSaved });


                // 3. Fallback logic: Only used if the hidden finalPrice is somehow invalid (should be rare)
                if (!finalPrice || isNaN(finalPrice) || finalPrice === 0) {
                    console.log("No valid final price read, using original price as fallback.");
                    finalPrice = originalPrice;
                    discount = 0;
                    amountSaved = 0;
                }

                // 4. Final validation before FETCH
                if (!productId || !finalPrice) {
                    alert("Error: Missing product or final price information.");
                    return;
                }

                // 5. Execute Fetch (API call remains the same)
                const res = await fetch("http://localhost:3000/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        finalPrice,
                        discount,
                        originalPrice,
                        amountSaved
                    }),
                    credentials: "include"
                });

                const data = await res.json();

                if (data.success && data.redirectTo) {
                    console.log("Redirecting to checkout page:", data.redirectTo);
                    window.location.href = data.redirectTo;
                } else {
                    alert(`Checkout failed: ${data.message || 'An unknown error occurred.'}`);
                }
            } catch (err) {
                console.error("Checkout error:", err);
               
                alert("Checkout failed: Unable to connect to server.");
            }
        });
    });
}



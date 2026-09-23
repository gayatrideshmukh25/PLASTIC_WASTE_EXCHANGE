import { useState } from "react";
import StatusNote from "../components/StatusNote.jsx";
import useApi from "../hooks/useApi.js";
import useGo from "../hooks/useGo.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { apiPost, NETWORK_ERROR } from "../api.js";
import { productImage } from "../utils/paths.js";

export default function Products() {
  usePageTitle("Eco-Friendly Products | Plastic Waste Exchange");

  const { data, loading, error } = useApi("/api/products");
  const products = data?.products ?? [];

  return (
    <>
      <h1>Eco-Friendly Products</h1>
      {loading && <StatusNote>Loading products…</StatusNote>}
      {error && <StatusNote variant="error">{error}</StatusNote>}
      <div className="products" id="products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

function ProductCard({ product }) {
  const go = useGo();
  const price = Number(product.price);

  const [couponCode, setCouponCode] = useState("");
  // What the "Buy Now" form sends. Starts as "no coupon"; replaced when a coupon is applied.
  const [deal, setDeal] = useState({
    applied: false,
    originalPrice: price,
    finalPrice: price,
    discount: 0,
    amountSaved: 0,
  });
  const [message, setMessage] = useState(null); // { ok, text }

  async function applyCoupon(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const { data } = await apiPost("/api/userDashboard/apply-coupon", {
        product_id: String(product.id),
        price: String(product.price),
        coupon_code: couponCode,
      });
      if (!data.success) {
        setMessage({ ok: false, text: data.message || "Failed to apply coupon" });
        return;
      }
      const originalPrice = Number(data.originalPrice ?? price);
      const finalPrice = Number(data.finalPrice) || originalPrice;
      const discount = Number(data.discount) || 0;
      setDeal({
        applied: true,
        originalPrice,
        finalPrice,
        discount,
        amountSaved: Number((originalPrice - finalPrice).toFixed(2)),
      });
      setMessage({ ok: true, text: `Coupon applied! You saved ${discount}%` });
    } catch {
      setMessage({ ok: false, text: NETWORK_ERROR });
    }
  }

  async function buyNow(e) {
    e.preventDefault();
    let { originalPrice, finalPrice, discount, amountSaved } = deal;

    if (!finalPrice || Number.isNaN(finalPrice)) {
      finalPrice = originalPrice;
      discount = 0;
      amountSaved = 0;
    }
    if (!finalPrice) {
      setMessage({ ok: false, text: "Error: Missing product or final price information." });
      return;
    }

    try {
      const { data } = await apiPost("/api/checkout", {
        productId: String(product.id),
        finalPrice,
        discount,
        originalPrice,
        amountSaved,
      });
      if (data.success && data.redirectTo) {
        go(data.redirectTo, "/checkouts");
      } else {
        setMessage({
          ok: false,
          text: `Checkout failed: ${data.message || "An unknown error occurred."}`,
        });
      }
    } catch {
      setMessage({ ok: false, text: "Checkout failed: Unable to connect to server." });
    }
  }

  return (
    <div className="product-card">
      <img src={productImage(product.image)} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p><b>Price:</b> ₹{product.price}</p>

      <form className="coupon-form" onSubmit={applyCoupon}>
        <input
          type="text"
          name="coupon_code"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button type="submit">Apply Coupon</button>
      </form>

      <p>
        <b>Original Price:</b>{" "}
        <span>
          {deal.applied ? <s style={{ color: "grey" }}>₹{deal.originalPrice}</s> : `₹${price.toFixed(2)}`}
        </span>
      </p>

      <div style={{ margin: "5px 0" }}>
        {deal.applied && (
          <>
            <p style={{ color: "#28a745", marginBottom: 3 }}>
              Discount Applied: <b>{deal.discount}%</b> (You Save: ₹{deal.amountSaved})
            </p>
            <p>
              <b>Final Price:</b>{" "}
              <b style={{ color: "#7b2ff2", fontSize: "1.2em" }}>₹{deal.finalPrice}</b>
            </p>
          </>
        )}
      </div>

      <div className="coupon-message" style={{ color: message?.ok ? "green" : "#9b2c2c" }} role="status">
        {message?.text}
      </div>

      <form className="buy-form" onSubmit={buyNow}>
        <button type="submit">Buy Now</button>
      </form>
    </div>
  );
}

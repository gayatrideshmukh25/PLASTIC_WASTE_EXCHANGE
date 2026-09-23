import { Link } from "react-router-dom";
import StatusNote from "../components/StatusNote.jsx";
import useApi from "../hooks/useApi.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { API_BASE } from "../api.js";

export default function Checkout() {
  usePageTitle("Checkout | Plastic Waste Exchange");

  const { data, loading, error } = useApi("/api/checkout/data");
  const checkout = data?.success ? data.checkoutData : null;

  return (
    <div className="page-checkout">
      <div className="checkout-wrap">
        <div className="checkout-card card">
          <h2 style={{ color: "#7b2ff2", margin: "0 0 1rem 0" }}>Checkout</h2>

          {loading && <StatusNote>Loading…</StatusNote>}
          {error && <StatusNote variant="error">{error}</StatusNote>}

          {!loading && !error && !checkout && (
            <>
              <StatusNote variant="error">No checkout data found</StatusNote>
              <ContinueShopping />
            </>
          )}

          {checkout && (
            // A real form POST: the payment step is handled (and redirected) by the backend.
            <form method="POST" action={`${API_BASE}/checkout/pay`}>
              <input type="hidden" name="originalPrice" value={checkout.originalPrice} />
              <input type="hidden" name="discount" value={checkout.discount} />
              <input type="hidden" name="finalPrice" value={checkout.finalPrice} />

              <div className="summary-row">
                <div className="label">Original Price</div>
                <div className="value">{checkout.originalPrice}</div>
              </div>
              <div className="summary-row">
                <div className="label">Discount</div>
                <div className="value">{checkout.discount}%</div>
              </div>
              <div className="summary-row">
                <div className="label">You Save</div>
                <div className="value">{checkout.amountSaved}</div>
              </div>

              <div className="final-price">Final Price : {checkout.finalPrice}</div>

              <div className="checkout-actions">
                <button type="submit" className="btn">Proceed to Pay</button>
                <ContinueShopping />
              </div>

              <div className="note">
                Secure payment. You will be redirected to the payment gateway after clicking Proceed
                to Pay.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ContinueShopping() {
  return (
    <Link
      to="/products"
      className="btn"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.6rem 1rem" }}
    >
      Continue Shopping
    </Link>
  );
}

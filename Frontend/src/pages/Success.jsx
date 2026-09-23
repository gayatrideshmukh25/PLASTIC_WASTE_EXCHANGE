import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Success() {
  usePageTitle("Success | Plastic Waste Exchange");

  return (
    <div className="page-success">
      <div className="success-card">
        <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="Success" width="90" />
        <h1>Request Submitted Successfully!</h1>
        <p>
          Your plastic waste exchange request has been sent. A nearby collector will contact you
          soon.
        </p>
        <Link className="success-btn" to="/userDashboard">Go to Home</Link>
      </div>
    </div>
  );
}

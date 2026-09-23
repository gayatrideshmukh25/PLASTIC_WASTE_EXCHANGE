import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Order matters: global.css first (it was loaded by every original page), then the page-specific
// sheets, which are scoped to a wrapper class so they cannot leak onto other pages.
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/request.css";
import "./styles/editProfile.css";
import "./styles/rewards.css";
import "./styles/checkout.css";
import "./styles/adminLists.css";
import "./styles/standalone.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

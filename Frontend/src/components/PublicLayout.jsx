import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";

/**
 * Header + footer for the logged-out pages (home, about, contact, learn more, login, signup).
 *
 * cta        "login" | "signup"  – which button sits at the right of the nav
 * textHome   show the word "Home" instead of the house icon (the login page does this)
 * logoSize   logo width in px (the auth pages use a smaller logo)
 * pageClass  wrapper class used to scope page-specific CSS (e.g. "page-auth")
 */
export default function PublicLayout({
  children,
  cta = "login",
  textHome = false,
  logoSize = 50,
  pageClass,
}) {
  return (
    <div className={pageClass}>
      <header>
        <h1>
          <img src="/images/image.png" alt="Recycle" width={logoSize} />
          PLASTIC WASTE EXCHANGE
        </h1>
        <nav>
          <Link to="/home" aria-label={textHome ? undefined : "Home"}>
            {textHome ? "Home" : <i className="fa-solid fa-house" />}
          </Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {cta === "signup" ? (
            <Link to="/signup" className="login-btn">Signup</Link>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </nav>
      </header>
      {children}
      <Footer />
    </div>
  );
}

import { Link, Navigate, useLocation } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

export default function NotFound() {
  usePageTitle("404 - Page Not Found");
  const { pathname, search, hash } = useLocation();

  // Old bookmarks / backend redirects such as "/login.html" → "/login".
  if (/\.html$/i.test(pathname)) {
    return <Navigate to={pathname.replace(/\.html$/i, "") + search + hash} replace />;
  }

  return (
    <div className="page-404">
      <div className="notfound-container">
        <h1>404</h1>
        <p>Oops! The page you are looking for does not exist.</p>
        <Link to="/home">Go Home</Link>
      </div>
    </div>
  );
}

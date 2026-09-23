import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isExternal, toRoute } from "../utils/paths.js";

// Replacement for `window.location.href = data.redirectTo`: navigates inside the SPA
// (no full page reload) and understands legacy ".html" targets from the backend.
export default function useGo() {
  const navigate = useNavigate();
  return useCallback(
    (target, fallback) => {
      const route = toRoute(target, fallback);
      if (isExternal(route)) window.location.assign(route);
      else navigate(route);
    },
    [navigate],
  );
}

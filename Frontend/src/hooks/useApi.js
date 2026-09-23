import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, NETWORK_ERROR } from "../api.js";

/**
 * GET `path` when the component mounts (and again whenever `refetch()` is called).
 *
 *   const { data, loading, error, refetch } = useApi("/api/userDashboard", { redirectIfFailed: "/login" });
 *
 * `redirectIfFailed` reproduces the old per-page guard:
 *   if (!data.success) window.location.href = "/login.html"
 * Old data stays on screen while a refetch is in flight, so tables don't flash empty.
 */
export default function useApi(path, { redirectIfFailed } = {}) {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const { data } = await apiGet(path, { signal: controller.signal });
        if (redirectIfFailed && !data.success) {
          navigateRef.current(redirectIfFailed, { replace: true });
          return;
        }
        setState({ data, loading: false, error: null });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState((s) => ({ ...s, loading: false, error: NETWORK_ERROR }));
      }
    })();

    return () => controller.abort();
  }, [path, tick, redirectIfFailed]);

  return { ...state, refetch };
}

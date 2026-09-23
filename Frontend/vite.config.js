import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In development the React app runs on :5173 and your Express API on :3000.
// Proxying makes the browser see ONE origin, so session cookies work exactly like they did
// when the old static pages were served by the backend (no CORS / cookie config needed).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.BACKEND_URL || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        // Form POST used by the checkout page ("Proceed to Pay"). Exact match, so it does not
        // capture the SPA route /checkouts.
        "^/checkout/pay$": { target: backend, changeOrigin: true },
      },
    },
  };
});

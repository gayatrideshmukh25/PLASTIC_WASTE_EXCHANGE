# Plastic Waste Exchange — React (Vite) conversion

This is the original static HTML/CSS/JS site converted to a React single-page app. It talks to
the **same Express backend** you already have — nothing on the server needs to change.

## Running it

```bash
npm install
cp .env.example .env      # edit BACKEND_URL if your API isn't on localhost:3000
npm run dev               # http://localhost:5173
```

`npm run dev` proxies every `/api/*` request (and the checkout form POST) to `BACKEND_URL`, so the
browser sees one origin and your session cookie keeps working exactly as before.

```bash
npm run build             # production build -> dist/
npm run preview           # serve that build locally
```

Deploying `dist/` as a static site works as long as your host **rewrites unknown paths to
`index.html`** (this is what makes client-side routes like `/userDashboard` work on refresh —
Netlify's `_redirects`, Vercel's rewrites, or nginx's `try_files` all do this). Set
`VITE_API_URL` at build time if the API lives on a different origin than the built site (and make
sure the API sends CORS headers that allow credentials).

## What changed vs. the static site, and why

- **One page, one router.** Every `.html` file became a route in `src/App.jsx`, using the same
  path minus the extension (`userDashboard.html` → `/userDashboard`), so the backend's existing
  `redirectTo: "/foo.html"` values still resolve correctly (see `src/utils/paths.js`).
- **Header/nav/profile-modal/footer, de-duplicated.** These were copy-pasted into ~20 HTML files.
  They're now `PublicLayout` and `DashboardLayout` (`src/components/`).
- **The three collector pages** (Dashboard / My Tasks / Completed Collections) were the same page
  three times with a different endpoint and one column. That's now one `CollectorRequestsPage`
  component parameterised per route.
- **Every `fetch(...).then(...)` became a `useApi`/`apiPost` call** (`src/hooks/useApi.js`,
  `src/api.js`) — same endpoints, same JSON shapes, same `credentials: "include"`, same
  `if (!data.success) redirect` guard, just re-expressed as React state instead of manual DOM
  writes.
- **CSS is untouched in content, only scoped.** `style.css` (the sheet every page loaded) is
  copied verbatim as the global stylesheet. The handful of page-specific `<style>` blocks and
  extra stylesheets (`authStyle.css`, `requeststyle.css`, `editProfile.html`'s inline style,
  `rewards.html`'s inline style, `checkouts.html`'s inline style) are scoped with
  `:where(.page-x) ...` so they can't leak onto other pages now that everything lives in one
  document — `:where()` keeps their specificity at zero, so they behave exactly like the plain
  selectors they were copied from.
- **Chart.js → react-chartjs-2**, feeding it the same `monthlyWaste` / `requestStatus` shapes the
  backend already returns.
- **Admin coupon and collector-request "Delete / Accept / Reject / Complete" links** (which called
  `fetch` then set `window.location.href`) are now buttons that re-fetch the current list, so the
  row updates in place instead of a full reload.
- **`feedback.html`** was a 0-byte file in the original zip, even though the admin nav links to it.
  It's now a placeholder page (`src/pages/admin/Feedback.jsx`) so the link isn't dead; swap in the
  real feature whenever it's built.
- **`contact.html`'s form** had no `action` or script — submitting it just reloaded the page. It's
  now a controlled form with a local "message noted" state and a `TODO` where you'd wire up an
  endpoint.

## Project layout

```
src/
  api.js                 fetch wrapper (credentials, JSON, never-throws-on-4xx)
  App.jsx                routes
  main.jsx               entry point + global CSS imports
  hooks/                 useApi (GET+state), useGo (redirect helper), usePageTitle
  utils/paths.js         "/foo.html" -> "/foo", product-image path fixups
  components/            PublicLayout, DashboardLayout, CollectorRequestsPage, StatusNote
  pages/                 one file per route, grouped by user/collector/admin/info
  styles/                global.css (=old style.css) + one scoped file per page-specific sheet
public/images/           unchanged asset copies
```

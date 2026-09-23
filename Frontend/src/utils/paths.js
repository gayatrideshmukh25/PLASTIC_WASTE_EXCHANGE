// The backend answers with `redirectTo` values written for the old multi-page site
// ("/userDashboard.html", "collectorDashboard.html", ...). React routes use the same names
// without the extension, so this maps one to the other.
export const ROLE_HOME = {
  user: "/userDashboard",
  collector: "/collectorDashboard",
  admin: "/adminDashboard",
};

const isExternal = (url) => /^(https?:)?\/\//i.test(url);

export function toRoute(target, fallback = "/login") {
  if (!target) return fallback;
  if (isExternal(target)) return target;
  const withSlash = target.startsWith("/") ? target : `/${target}`;
  const route = withSlash.replace(/\.html(?=$|[?#])/i, "");
  return route === "/index" ? "/home" : route;
}

export { isExternal };

// Product images: the API may return "/public/images/products/x.jpeg" (old static folder) or
// "/images/products/x.jpeg". Vite serves ./public at the site root, so both map to /images/....
export function productImage(src) {
  if (!src) return "";
  if (isExternal(src)) return src;
  return src.replace(/^\/?public\//, "/").replace(/^(?!\/)/, "/");
}

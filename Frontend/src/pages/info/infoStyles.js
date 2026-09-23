// The About / Learn More / Contact pages styled their content with inline `style` attributes.
// They are kept as (shared) style objects rather than CSS classes on purpose: inline styles
// out-rank the global `.card h2 / .card ul` rules, and this keeps that behaviour identical.
export const sectionStyle = {
  padding: "50px 20px",
  maxWidth: 900,
  margin: "auto",
  fontFamily: "Arial, sans-serif",
};
export const h1Style = { fontSize: 34, color: "#0a7b56", marginBottom: 20 };
export const h2Style = { fontSize: 26, color: "#0a7b56", marginTop: 40 };
export const pStyle = { fontSize: 18, color: "#444", lineHeight: 1.7 };
export const listStyle = { fontSize: 18, color: "#444", lineHeight: 1.9 };
export const orderedListStyle = { ...listStyle, marginLeft: 20 };

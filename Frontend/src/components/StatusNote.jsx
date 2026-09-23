// Small loading / error / empty-state line used by pages that fetch data.
export default function StatusNote({ children, variant }) {
  const cls = ["status-note", variant && `is-${variant}`].filter(Boolean).join(" ");
  return <p className={cls}>{children}</p>;
}

import PublicLayout from "../../components/PublicLayout.jsx";
import { sectionStyle } from "./infoStyles.js";

// Shared shell for About / Learn More / Contact: public header + one big content card.
export default function InfoPage({ children }) {
  return (
    <PublicLayout>
      <section className="Hcontainer" style={sectionStyle}>
        <div className="dashboard-grid">
          <div className="card">{children}</div>
        </div>
      </section>
    </PublicLayout>
  );
}

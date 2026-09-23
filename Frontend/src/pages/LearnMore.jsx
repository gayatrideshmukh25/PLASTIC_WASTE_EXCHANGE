import InfoPage from "./info/InfoPage.jsx";
import { h1Style, h2Style, pStyle, listStyle, orderedListStyle } from "./info/infoStyles.js";
import usePageTitle from "../hooks/usePageTitle.js";

const STEPS = [
  <><strong>User registers</strong> and logs in.</>,
  <>The user selects the <strong>waste type</strong> and enters quantity.</>,
  <>The system finds the <strong>nearest collector</strong> based on location.</>,
  <>The user sends a <strong>pickup request</strong>.</>,
  <>The collector reviews and <strong>accepts or rejects</strong> the request.</>,
  <>Once collected, the collector marks it as <strong>Completed</strong>.</>,
  <>The user earns <strong>Reward Points</strong> for responsible disposal.</>,
  <>Points can be <strong>redeemed for eco-friendly coupons</strong>.</>,
];

const KEY_FEATURES = [
  "✔ Real-time nearest collector search",
  "✔ Doorstep waste pickup request",
  "✔ Request tracking for users",
  "✔ Collector dashboard for managing pickups",
  "✔ Automatic reward points system",
  "✔ Eco-friendly discount coupon redemption",
  "✔ Clean, simple, and user-friendly design",
];

const BENEFITS = [
  "🌍 Cleaner and greener surroundings",
  "♻ Encourages recycling habits among citizens",
  "🚛 Faster and organized waste collection",
  "🎁 Rewards users for helping the environment",
  "🤝 Builds a strong community connection",
];

const FACTS = [
  "🌱 Plastic takes 400–1000 years to decompose.",
  "🌱 India generates nearly 25,000 tonnes of plastic waste every day.",
  "🌱 Only 60% of this waste is recycled effectively.",
  "🌱 Every small action towards recycling makes a huge difference.",
];

const FUTURE = [
  "📍 Live map tracking for collectors",
  "📩 SMS / email notification system",
  "📱 A dedicated Android mobile app",
  "🧠 AI to identify waste type using images",
  "🏛 Integration with municipal waste centers",
];

const List = ({ items }) => (
  <ul style={listStyle}>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export default function LearnMore() {
  usePageTitle("Learn More | Plastic Waste Exchange");

  return (
    <InfoPage>
      <h1 style={h1Style}>Learn More</h1>
      <p style={pStyle}>
        Our Plastic Waste Exchange System is built to make waste pickup simple, transparent, and
        rewarding. Here you can learn how our platform works, why it matters, and how it
        contributes to a cleaner environment.
      </p>

      <h2 style={h2Style}>How It Works</h2>
      <ol style={orderedListStyle}>
        {STEPS.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <h2 style={h2Style}>Key Features</h2>
      <List items={KEY_FEATURES} />

      <h2 style={h2Style}>Why It Matters</h2>
      <p style={pStyle}>
        Plastic waste is one of the biggest environmental challenges. Our platform encourages
        households to recycle by making the process easy and rewarding. With every request, users
        actively contribute to reducing pollution and creating a healthier community.
      </p>

      <h2 style={h2Style}>Benefits</h2>
      <List items={BENEFITS} />

      <h2 style={h2Style}>Environmental Impact</h2>
      <p style={pStyle}>Did you know?</p>
      <List items={FACTS} />

      <h2 style={h2Style}>Future Enhancements</h2>
      <List items={FUTURE} />
    </InfoPage>
  );
}

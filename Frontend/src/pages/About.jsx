import InfoPage from "./info/InfoPage.jsx";
import { h1Style, h2Style, pStyle, listStyle } from "./info/infoStyles.js";
import usePageTitle from "../hooks/usePageTitle.js";

const WHAT_WE_DO = [
  "Connect users with nearby waste collectors instantly.",
  "Provide doorstep pickup for plastic waste.",
  "Offer real-time tracking and request status updates.",
  "Reward users with points for responsible disposal.",
  "Allow users to redeem eco-points for exclusive discounts.",
];

const HOW_IT_HELPS = [
  "🌍 Reduces plastic waste in local communities.",
  "♻ Promotes a culture of recycling and sustainability.",
  "🚛 Ensures faster and organized waste collection.",
  "🎁 Rewards users for contributing to the environment.",
];

export default function About() {
  usePageTitle("About | Plastic Waste Exchange");

  return (
    <InfoPage>
      <h1 style={h1Style}>About Our Platform</h1>
      <p style={pStyle}>
        Our Plastic Waste Exchange System is a community-driven platform designed to make plastic
        waste disposal simple, efficient, and rewarding. We aim to bring citizens and waste
        collectors together to create a cleaner and more sustainable environment.
      </p>

      <h2 style={h2Style}>Our Mission</h2>
      <p style={pStyle}>
        We believe small steps can create big changes. Our mission is to empower every household to
        responsibly dispose of plastic waste while encouraging eco-friendly habits through a
        transparent and rewarding system.
      </p>

      <h2 style={h2Style}>What We Do</h2>
      <ul style={listStyle}>
        {WHAT_WE_DO.map((item) => (
          <li key={item}>✔ {item}</li>
        ))}
      </ul>

      <h2 style={h2Style}>Why It Matters</h2>
      <p style={pStyle}>
        Plastic pollution is a growing global issue. Many people want to recycle but lack access to
        proper systems. Our platform makes the process accessible and convenient, encouraging
        households to become active participants in reducing waste and protecting the environment.
      </p>

      <h2 style={h2Style}>How It Helps</h2>
      <ul style={listStyle}>
        {HOW_IT_HELPS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 style={h2Style}>Our Vision</h2>
      <p style={pStyle}>
        We envision a world where waste management is seamless, sustainable, and community-driven.
        By bridging the gap between households and waste collectors, we aim to build a cleaner
        future for everyone.
      </p>
    </InfoPage>
  );
}

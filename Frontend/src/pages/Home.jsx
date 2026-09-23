import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const STEPS = [
  { img: "/images/login.png", text: "Login / Signup" },
  { img: "/images/waste.png", text: "Log your plastic waste" },
  { img: "/images/3d-map.png", text: "Find nearby recycler" },
  { img: "/images/gift-box.png", text: "Earn rewards" },
];

export default function Home() {
  usePageTitle("Plastic Waste Exchange");

  return (
    <PublicLayout>
      <section className="hero">
        <div className="hero-text">
          <h2>
            Recycle Plastic, <br />
            Earn Rewards!
          </h2>
          <p>Connect with nearby recyclers and help the environment</p>
          <Link className="btn btn-get" to="/signup">Get Started</Link>
          <Link className="btn btn-learn" to="/learnMore">Learn More</Link>
        </div>
        <div className="hero-image">
          <i className="fa-solid fa-recycle fa-10x" aria-hidden="true" />
        </div>
      </section>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          {STEPS.map((step) => (
            <div className="step" key={step.text}>
              <img src={step.img} alt="" width="50" />
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

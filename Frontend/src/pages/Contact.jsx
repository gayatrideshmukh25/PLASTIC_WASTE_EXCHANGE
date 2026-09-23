import { useState } from "react";
import InfoPage from "./info/InfoPage.jsx";
import { h1Style, h2Style, pStyle } from "./info/infoStyles.js";
import usePageTitle from "../hooks/usePageTitle.js";

const labelStyle = { fontSize: 16, fontWeight: "bold" };
const fieldStyle = {
  width: "100%",
  padding: 10,
  margin: "8px 0 18px",
  borderRadius: 6,
  border: "1px solid #ccc",
};

export default function Contact() {
  usePageTitle("Contact | Plastic Waste Exchange");

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    setSent(false);
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    // The original form had no action or script (submitting just reloaded the page).
    // TODO: POST `form` to your backend / email service here.
    setForm({ name: "", email: "", message: "" });
    setSent(true);
  }

  return (
    <InfoPage>
      <h1 style={h1Style}>Contact Us</h1>
      <p style={pStyle}>
        Have questions, need help, or want to share your feedback? We’d love to hear from you! Feel
        free to reach out using the details below.
      </p>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 26, color: "#0a7b56" }}>Get In Touch</h2>
        <p style={{ fontSize: 18, color: "#444", lineHeight: 1.8, marginTop: 10 }}>
          📍 <strong>Location:</strong> Maharashtra, India
          <br />
          📞 <strong>Phone:</strong> +91 9876543210
          <br />
          📧 <strong>Email:</strong> support@plasticexchange.com
        </p>
      </div>

      <div
        style={{
          marginTop: 40,
          background: "#ffffff",
          padding: 25,
          borderRadius: 10,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: 26, color: "#0a7b56" }}>Send Us a Message</h2>

        <form style={{ marginTop: 20 }} onSubmit={handleSubmit}>
          <label htmlFor="contact-name" style={labelStyle}>Your Name</label>
          <br />
          <input
            id="contact-name"
            type="text"
            placeholder="Enter your name"
            style={fieldStyle}
            value={form.name}
            onChange={update("name")}
          />

          <label htmlFor="contact-email" style={labelStyle}>Your Email</label>
          <br />
          <input
            id="contact-email"
            type="email"
            placeholder="Enter your email"
            style={fieldStyle}
            value={form.email}
            onChange={update("email")}
          />

          <label htmlFor="contact-message" style={labelStyle}>Message</label>
          <br />
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Write your message..."
            style={fieldStyle}
            value={form.message}
            onChange={update("message")}
          />

          <button
            type="submit"
            style={{
              background: "#0a7b56",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              fontSize: 16,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Send Message
          </button>
          {sent && <p style={{ color: "#0a7b56", fontWeight: 600 }}>Thanks! Your message has been noted.</p>}
        </form>
      </div>
    </InfoPage>
  );
}

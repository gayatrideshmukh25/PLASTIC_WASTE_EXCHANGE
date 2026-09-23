import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import useApi from "../../hooks/useApi.js";
import useGo from "../../hooks/useGo.js";
import usePageTitle from "../../hooks/usePageTitle.js";
import { apiGet, apiPost, NETWORK_ERROR } from "../../api.js";

const EMPTY_FORM = {
  waste_type: "",
  quantity: "",
  pickup_address: "",
  preferred_date: "",
  preferred_time: "",
  notes: "",
};

export default function SendRequest() {
  usePageTitle("Send Waste Request | Plastic Waste Exchange");

  const go = useGo();
  const { data } = useApi("/api/userDashboard/sendRequest", { redirectIfFailed: "/login" });

  const [form, setForm] = useState(EMPTY_FORM);
  const [locationStatus, setLocationStatus] = useState("");
  const [collector, setCollector] = useState(null); // nearest collector chosen by geolocation
  const [collectorNote, setCollectorNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function findNearestCollector() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported.");
      return;
    }
    setLocationStatus("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setLocationStatus(`Your location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        try {
          const { data: found } = await apiGet(
            `/api/userDashboard/nearestCollector?lat=${latitude}&lng=${longitude}`,
          );
          if (found.name) {
            setCollector(found);
            setCollectorNote("");
          } else {
            setCollector(null);
            setCollectorNote(found.message || "No nearby collectors found.");
          }
        } catch {
          setLocationStatus("Failed to fetch nearest collector.");
        }
      },
      () => setLocationStatus("Unable to retrieve your location."),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: res } = await apiPost("/api/userDashboard/postRequest", {
        collector_id: collector?.id ?? "",
        ...form,
      });
      if (!res.success) {
        alert(res.message || "Request Submission Failed");
        return;
      }
      go(res.redirectTo, "/success");
    } catch {
      alert(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="user" user={data?.user} pageClass="page-request">
      <main>
        <div className="card">
          <h1>Send Waste Pickup Request</h1>

          <div className="location-section">
            <h3>Find Nearest Collector</h3>
            <button type="button" id="findLocationBtn" onClick={findNearestCollector}>
              Use My Location
            </button>
            <p id="locationStatus">{locationStatus}</p>
            <div id="nearestCollector">
              {collector ? (
                <>
                  <h3>Nearest Collector Found:</h3>
                  <p><strong>Name:</strong> {collector.name}</p>
                  <p><strong>Phone:</strong> {collector.phone}</p>
                  <p><strong>Address:</strong> {collector.address}</p>
                  <p><strong>Distance:</strong> {collector.distance} km</p>
                </>
              ) : (
                collectorNote
              )}
            </div>
          </div>
          <hr />

          <form id="wasteForm" onSubmit={handleSubmit} onReset={() => setForm(EMPTY_FORM)}>
            <div>
              <label htmlFor="wasteType">Waste Type</label>
              <select id="wasteType" name="waste_type" required
                value={form.waste_type} onChange={update("waste_type")}>
                <option value="">Select Waste Type</option>
                <option value="dry">Dry / Recyclable</option>
                <option value="wet">Wet / Organic</option>
                <option value="e-waste">E-Waste</option>
                <option value="hazardous">Hazardous</option>
                <option value="bulk">Bulk Items</option>
              </select>
            </div>
            <div>
              <label htmlFor="quantity">Quantity</label>
              <input type="text" id="quantity" name="quantity" placeholder="e.g. 3 bags / 5 kg"
                value={form.quantity} onChange={update("quantity")} />
            </div>
            <div className="full">
              <label htmlFor="address">Pickup Address</label>
              <textarea id="address" name="pickup_address" placeholder="Enter pickup location" required
                value={form.pickup_address} onChange={update("pickup_address")} />
            </div>
            <div>
              <label htmlFor="date">Preferred Date</label>
              <input type="date" id="date" name="preferred_date"
                value={form.preferred_date} onChange={update("preferred_date")} />
            </div>
            <div>
              <label htmlFor="time">Preferred Time</label>
              <input type="time" id="time" name="preferred_time"
                value={form.preferred_time} onChange={update("preferred_time")} />
            </div>
            <div className="full">
              <label htmlFor="notes">Additional Notes</label>
              <textarea id="notes" name="notes" placeholder="Any extra details for pickup team"
                value={form.notes} onChange={update("notes")} />
            </div>
            <div className="actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send Request"}
              </button>
              <button type="reset" className="btn-secondary">Reset</button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}

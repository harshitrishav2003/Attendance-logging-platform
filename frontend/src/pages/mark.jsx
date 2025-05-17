import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages/AdminDashboardPage/AdminDashboard.css";

function MarkAttendance() {
  const [loading, setLoading] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });

  // Get current geolocation
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => alert("Unable to retrieve your location")
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split(".")[1])).id; // Decode JWT

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const response = await axios.post(
        "https://attendance-logging-platform.onrender.com/api/attendance/mark",
        {
          userId,
          date: today,
          status: isHoliday ? "Holiday" : "Present",
          lat: location.lat,
          lng: location.lng,
          wfh,
          holiday: isHoliday,

        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Attendance marked successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mark-attendance-container">
  <h3>Mark Attendance for Today</h3>

  <label>
    <input
      type="checkbox"
      checked={wfh}
      onChange={(e) => setWfh(e.target.checked)}
      disabled={isHoliday}
    />
    Work From Home (WFH)
  </label>

  {/* <label>
    <input
      type="checkbox"
      checked={isHoliday}
      onChange={(e) => {
        setIsHoliday(e.target.checked);
        if (e.target.checked) setWfh(false);
      }}
    />
    Mark Today as Holiday
  </label> */}

  <button onClick={handleSubmit} disabled={loading}>
    {loading ? "Marking..." : isHoliday ? "Mark Holiday" : "Mark Attendance"}
  </button>

  {message && <p>{message}</p>}

  <p>
    Your current location:{" "}
    {location.lat && location.lng
      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      : "Fetching..."}
  </p>
</div>

  );
}

export default MarkAttendance;

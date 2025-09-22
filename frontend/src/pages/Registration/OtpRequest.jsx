import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function OtpRequest() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || ""; // must come from RegisterStudent
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Email is missing. Please register again.");
      return;
    }
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Verification failed (${res.status})`);
      }

      setInfo(data.message || "OTP verified successfully.");
      // After success → go to login
      setTimeout(() => navigate("/login", { replace: true }), 400);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="otp-request" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Enter OTP</h2>
      <p style={{ marginTop: -6, color: "#555" }}>
        We sent a one-time password to <strong>{email || "(missing email)"}</strong>.
      </p>

      <form onSubmit={handleVerify} noValidate>
        {/* Only OTP input as requested */}
        <div>
          <label htmlFor="otp">OTP</label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 8 }} role="alert">
            {error}
          </p>
        )}
        {info && (
          <p style={{ color: "seagreen", marginTop: 8 }} role="status">
            {info}
          </p>
        )}

        <button type="submit" disabled={verifying} style={{ marginTop: 12 }}>
          {verifying ? "Verifying..." : "Next"}
        </button>
      </form>
    </div>
  );
}

export default OtpRequest;

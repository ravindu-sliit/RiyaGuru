// src/pages/Registration/OtpRequest.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function OtpRequest() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state?.email || "").toLowerCase();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null); // seconds (from 429)

  // only enable submit when OTP has exactly 6 digits
  const isOtpValidShape = useMemo(() => /^\d{6}$/.test(otp), [otp]);

  // keep only digits; max 6 chars
  const handleChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D+/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);
    setRetryAfter(null);

    if (!email) {
      setError("Email is missing. Please register again.");
      setShowResend(false);
      return;
    }
    if (!isOtpValidShape) {
      setError("Please enter a valid 6-digit code.");
      setShowResend(false);
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // If backend says expired or invalid, show resend CTA
        const msg = (data && data.message) || `Verification failed (${res.status})`;
        setError(msg);
        setShowResend(true);
        return;
      }

      setInfo(data.message || "OTP verified successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 400);
    } catch (err) {
      setError(err.message || "Verification failed.");
      setShowResend(true);
    } finally {
      setVerifying(false);
    }
  };

  const requestNewOtp = async () => {
    setError("");
    setInfo("");
    setResending(true);
    setRetryAfter(null);

    try {
      const res = await fetch(`${API_BASE}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // If server blocks re-send because an active OTP exists, it may return 429 with Retry-After
      const body = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const ra = res.headers.get("Retry-After");
        const secs = ra ? parseInt(ra, 10) : null;
        setRetryAfter(Number.isFinite(secs) ? secs : null);
        setError(
          body?.message ||
            (secs
              ? `An OTP was already sent. Please try again in ${secs} seconds.`
              : "An OTP was already sent. Please try again soon.")
        );
        setShowResend(true);
        return;
      }

      if (!res.ok) {
        throw new Error(body?.message || `Failed to send OTP (${res.status})`);
      }

      setInfo(body?.message || "A new OTP has been sent to your email.");
      setShowResend(false);
    } catch (err) {
      setError(err.message || "Failed to request a new OTP.");
      setShowResend(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-request" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Enter OTP</h2>
      <p style={{ marginTop: -6, color: "#555" }}>
        We sent a one-time password to <strong>{email || "(missing email)"}</strong>.
      </p>

      <form onSubmit={handleVerify} noValidate>
        {/* OTP input: 6 digits only */}
        <div>
          <label htmlFor="otp">OTP</label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="6-digit code"
            value={otp}
            onChange={handleChange}
            required
            aria-invalid={!isOtpValidShape}
          />
          <small style={{ display: "block", color: "#666" }}>
            Enter exactly 6 digits.
          </small>
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

        <button
          type="submit"
          disabled={verifying || !isOtpValidShape}
          style={{ marginTop: 12 }}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>

        {/* Resend option shown on any failure (expired or invalid) */}
        {showResend && (
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={requestNewOtp} disabled={resending}>
              {resending ? "Sending new OTP..." : "Request New OTP"}
            </button>
            {retryAfter != null && (
              <div style={{ marginTop: 6, color: "#555" }}>
                Try again in about {retryAfter} second{retryAfter === 1 ? "" : "s"}.
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default OtpRequest;

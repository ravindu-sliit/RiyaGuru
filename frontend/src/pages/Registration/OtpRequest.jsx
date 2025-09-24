// src/pages/Registration/OtpRequest.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/otp-request.css"; // make sure this CSS file exists

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

  // success modal
  const [showSuccess, setShowSuccess] = useState(false);

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
        const msg = (data && data.message) || `Verification failed (${res.status})`;
        setError(msg);
        setShowResend(true);
        return;
      }

      // Success — show modal
      setInfo(data.message || "OTP verified successfully.");
      setShowSuccess(true);
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

  const goToLogin = useCallback(() => {
    setShowSuccess(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Enter key triggers Login when modal is open
  useEffect(() => {
    if (!showSuccess) return;
    const onKey = (e) => {
      if (e.key === "Enter") goToLogin();
      if (e.key === "Escape") setShowSuccess(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSuccess, goToLogin]);

  return (
    <div className="otp-request">
      <h2>Enter OTP</h2>
      <p>
        We sent a one-time password to <strong>{email || "(missing email)"}</strong>.
      </p>

      <form onSubmit={handleVerify} noValidate>
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
          <small>Enter exactly 6 digits.</small>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {info && !showSuccess && (
          <p className="form-info" role="status">
            {info}
          </p>
        )}

        <button type="submit" disabled={verifying || !isOtpValidShape}>
          {verifying ? "Verifying..." : "Verify"}
        </button>

        {showResend && (
          <div className="resend-section">
            <button type="button" onClick={requestNewOtp} disabled={resending}>
              {resending ? "Sending new OTP..." : "Request New OTP"}
            </button>
            {retryAfter != null && (
              <div className="retry-hint">
                Try again in about {retryAfter} second{retryAfter === 1 ? "" : "s"}.
              </div>
            )}
          </div>
        )}
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="otp-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-success-title"
          onClick={(e) => {
            if (e.target.classList.contains("otp-modal")) setShowSuccess(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="otp-modal-card"
            style={{
              background: "#fff",
              width: "min(560px, 92vw)",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                margin: "0 auto 14px",
                display: "grid",
                placeItems: "center",
                background: "rgba(40,167,69,.08)",
                border: "2px solid rgba(40,167,69,.35)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#28A745"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3
              id="otp-success-title"
              style={{
                margin: "0 0 6px",
                fontSize: 22,
                fontWeight: 800,
                color: "#0A1A2F",
              }}
            >
              Account Successfully Created
            </h3>
            <p style={{ margin: "0 0 18px", color: "#3a4a62" }}>
              {info || "Your email has been verified. You can now log in."}
            </p>

            <button
              onClick={goToLogin}
              autoFocus
              style={{
                minWidth: 140,
                padding: "10px 18px",
                border: "none",
                borderRadius: 10,
                background: "#28A745",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(40,167,69,.35)",
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OtpRequest;

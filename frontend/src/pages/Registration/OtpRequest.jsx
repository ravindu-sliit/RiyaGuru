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

  // Redirect to register if email is missing
  useEffect(() => {
    if (!email) {
      setError("Email is missing. Please register again.");
      const timer = setTimeout(() => {
        navigate("/register", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate]);

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
    <div className="otp-page-container">
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

        {!email ? (
          <button 
            type="button" 
            onClick={() => navigate("/register")}
            style={{ marginTop: "12px" }}
          >
            Go to Register
          </button>
        ) : (
          <>
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
          </>
        )}
      </form>

      {/* Success Modal - positioned exactly on top of OTP box */}
      {showSuccess && (
        <div
          className="otp-success-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-success-title"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            className="otp-success-card"
            style={{
              width: "min(500px, 90vw)",
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "18px",
              boxShadow: "0 0 60px rgba(0, 0, 0, 0.5)",
              padding: "40px",
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
                background: "rgba(40,167,69,.25)",
                border: "2px solid rgba(40,167,69,.6)",
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
                  stroke="#4ADE80"
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
                color: "#FFFFFF",
              }}
            >
              Account Successfully Created
            </h3>
            <p style={{ margin: "0 0 18px", color: "rgba(255, 255, 255, 0.8)" }}>
              {info || "Your email has been verified. You can now log in."}
            </p>

            <button
              onClick={goToLogin}
              autoFocus
              style={{
                width: "100%",
                height: "48px",
                border: "none",
                borderRadius: "14px",
                background: "#28A745",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 22px rgba(40,167,69,.35)",
                transition: "filter .15s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.filter = "brightness(.96)";
                e.target.style.boxShadow = "0 12px 30px rgba(40,167,69,.45)";
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = "brightness(1)";
                e.target.style.boxShadow = "0 8px 22px rgba(40,167,69,.35)";
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default OtpRequest;

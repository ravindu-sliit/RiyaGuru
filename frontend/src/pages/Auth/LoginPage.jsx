// src/pages/Auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const EMAIL_RE =
    /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$/;

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const validateEmailFormat = (val) => {
    const v = String(val || "").trim();
    if (!v) return "Email or ID is required";

    if (v.includes("@")) return EMAIL_RE.test(v) ? "" : "Enter a valid email";
    if (/^[A-Za-z0-9]+$/.test(v)) return ""; // allow IDs
    return "Enter a valid email or ID";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setEmailError("");
    setPasswordError("");

    const raw = email.trim();
    const emailFmtErr = validateEmailFormat(raw);
    const normalizedEmail = raw.includes("@") ? raw.toLowerCase() : raw;

    if (emailFmtErr) setEmailError(emailFmtErr);
    if (!password) setPasswordError("Passcode is required");
    if (emailFmtErr || !password) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "";
        if (res.status === 404 || /user not found/i.test(msg)) {
          setEmailError("Email is not registered");
        } else if (res.status === 400 || /invalid credentials/i.test(msg)) {
          setPasswordError("Invalid Credentials");
        } else {
          setGeneralError(msg || `Login failed (${res.status})`);
        }
        return;
      }

      if (data.token) localStorage.setItem("rg_token", data.token);
      if (data.userId) localStorage.setItem("rg_userId", data.userId);
      if (data.role) localStorage.setItem("rg_role", data.role);

      try {
        const authObj = { token: data.token, userId: data.userId, role: data.role };
        localStorage.setItem("rg_auth", JSON.stringify(authObj));
      } catch {}

      const inferredId =
        data.studentId ??
        data.userId ??
        data.id ??
        data.user?.id ??
        data.user?.studentId ??
        null;
      if (inferredId) localStorage.setItem("rg_id", String(inferredId));

      if (data.role === "Student") navigate("/student", { replace: true });
      else if (data.role === "Instructor") navigate("/instructor", { replace: true });
      else if (data.role === "Admin") navigate("/admin/home/admin", { replace: true });
      else navigate("/landing", { replace: true });
    } catch (err) {
      setGeneralError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel (glass / black translucent) */}
      <div className="login-left">
        <h2>Sign In to RiyaGuru.LK</h2>
        <p className="subtitle">
          Access the Student Portal using your email and passcode.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            placeholder="Enter your registered email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailError(validateEmailFormat(email))}
            aria-invalid={!!emailError}
          />
          {emailError && <p className="error">{emailError}</p>}

          {/* Password */}
          <div className="passcode-label">
            <label htmlFor="password">Passcode</label>
            <button
              type="button"
              className="forgot"
              onClick={() => navigate("/forgot-password")}
            >
              
            </button>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Enter your passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!passwordError}
          />
          {passwordError && <p className="error">{passwordError}</p>}

          {generalError && <p className="error">{generalError}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="create-account">
          New on our platform?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </p>

        <footer>
          <button type="button" className="link-btn">Terms &amp; Conditions</button> |{" "}
          <button type="button" className="link-btn">Privacy Policy</button> |{" "}
          <button type="button" className="link-btn">Refund Policy</button>
          <p>© RiyaGuru LK – Online Portal</p>
        </footer>
      </div>

      {/* Right Panel (full-bleed image, dark overlay) */}
      <div className="login-right" />
    </div>
  );
}

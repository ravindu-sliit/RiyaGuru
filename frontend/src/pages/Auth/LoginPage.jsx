// src/pages/Auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // field-level errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // general (non-field) error
  const [generalError, setGeneralError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // ---------------- Email validation ----------------
  const validateEmailFormat = (val) => {
    const v = val.trim();
    if (!v) return "Email is required";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? ""
      : "Enter a valid email address";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setEmailError("");
    setPasswordError("");

    const normalizedEmail = email.trim().toLowerCase();

    // front-end validation
    const emailFmtErr = validateEmailFormat(normalizedEmail);
    if (emailFmtErr) {
      setEmailError(emailFmtErr);
    }
    if (!password) {
      setPasswordError("Password is required");
    }
    if (emailFmtErr || !password) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (data && data.message) || "";
        if (res.status === 404 || /user not found/i.test(msg)) {
          setEmailError("Email is not registered");
        } else if (res.status === 400 || /invalid credentials/i.test(msg)) {
          setPasswordError("Invalid Credentials");
        } else {
          setGeneralError(msg || `Login failed (${res.status})`);
        }
        return;
      }

      // Save token & minimal user info
      if (data.token) localStorage.setItem("rg_token", data.token);
      if (data.userId) localStorage.setItem("rg_userId", data.userId);
      if (data.role) localStorage.setItem("rg_role", data.role);

      // Infer ID
      const inferredId =
        data.studentId ??
        data.userId ??
        data.id ??
        data.user?.id ??
        data.user?.studentId ??
        null;

      if (inferredId) {
        localStorage.setItem("rg_id", String(inferredId));
      } else {
        console.warn(
          "Login success, but couldn't infer student id from response:",
          data
        );
      }



      // ✅ Redirect based on role

      if (data.role === "Student") {
        navigate("/home/student", { replace: true });
      } else if (data.role === "Instructor") {
        navigate("/home/instructor", { replace: true });
      } else if (data.role === "Admin") {
        navigate("/home/admin", { replace: true });
      } else {
        navigate("/landing", { replace: true });
      }

    } catch (err) {
      setGeneralError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "10vh auto",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        background: "white",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16, textAlign: "center" }}>
        Login
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            onBlur={() => setEmailError(validateEmailFormat(email))}
            required
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
          {emailError && (
            <p style={{ color: "crimson", marginTop: 6 }} role="alert">
              {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 6 }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            required
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
          {passwordError && (
            <p style={{ color: "crimson", marginTop: 6 }} role="alert">
              {passwordError}
            </p>
          )}
        </div>

        {/* General error */}
        {generalError && (
          <p
            style={{
              color: "crimson",
              marginTop: 4,
              marginBottom: 8,
              textAlign: "center",
            }}
            role="alert"
          >
            {generalError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#1f6feb",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {submitting ? "Signing in..." : "Next"}
        </button>
      </form>

      {/* Sign Up clickable text */}
      <p style={{ textAlign: "center", marginTop: 16 }}>
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          style={{
            color: "#1f6feb",
            cursor: "pointer",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}

// src/pages/Auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

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
        throw new Error(data.message || `Login failed (${res.status})`);
      }

      // Save token & minimal user info
      if (data.token) localStorage.setItem("rg_token", data.token);
      if (data.userId) localStorage.setItem("rg_userId", data.userId);
      if (data.role) localStorage.setItem("rg_role", data.role); // "Student" | "Instructor" | "Admin"

      // ✅ Redirect based on role
      if (data.role === "Student") {
        navigate("/home/student", { replace: true });
      } else if (data.role === "Instructor") {
        navigate("/home/instructor", { replace: true });
      } else if (data.role === "Admin") {
        navigate("/home/admin", { replace: true });
      } else {
        // fallback if no role provided
        navigate("/landing", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
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
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        </div>

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
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <p
            style={{
              color: "crimson",
              marginTop: 4,
              marginBottom: 8,
              textAlign: "center",
            }}
            role="alert"
          >
            {error}
          </p>
        )}

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
    </div>
  );
}

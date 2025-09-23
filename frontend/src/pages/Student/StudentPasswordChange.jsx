// src/pages/Student/StudentPasswordChange.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";

export default function StudentPasswordChange() {
  const { id } = useParams(); // studentId
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");

  const [email, setEmail] = useState("");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const data = await apiFetch(`/api/students/${id}`);
        setEmail(data.student?.email || "");
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!oldPwd || !newPwd || !newPwd2) {
      setErr("Please fill all fields.");
      return;
    }
    if (newPwd !== newPwd2) {
      setErr("New passwords do not match.");
      return;
    }
    if (newPwd.length < 6) {
      setErr("New password must be at least 6 characters.");
      return;
    }

    try {
      // 1) Validate old password by trying to login
      const resLogin = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: oldPwd }),
      });
      const bodyLogin = await resLogin.json().catch(() => ({}));
      if (!resLogin.ok) {
        throw new Error(bodyLogin.message || "Old password is incorrect.");
      }

      // 2) Update password through StudentController
      const updateRes = await apiFetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPwd }),
      });

      setOk("Password changed successfully.");
      setTimeout(() => navigate(`/student/${id}/dashboard`, { replace: true }), 700);
    } catch (e) {
      setErr(e.message);
    }
  }

  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Change Password</h2>
      <p><Link to={`/student/${id}/dashboard`}>&larr; Back to Dashboard</Link></p>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 8 }}>{ok}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input value={email} disabled style={{ width: "100%", background: "#f7f7f7" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Current Password</label>
          <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>New Password</label>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Confirm New Password</label>
          <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} style={{ width: "100%" }} />
        </div>

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

// src/pages/Student/StudentPasswordChange.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";
import "../../styles/student-password-change.css";

export default function StudentPasswordChange() {
  const { id } = useParams();
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

  function validatePassword(pwd) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(pwd);
  }

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
    if (!validatePassword(newPwd)) {
      setErr(
        "Password must be at least 6 characters long, include one uppercase, one lowercase, one number, and one special character."
      );
      return;
    }

    try {
      const resLogin = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: oldPwd }),
      });

      if (!resLogin.ok) throw new Error("Old Password Incorrect");

      await apiFetch(`/api/students/${id}`, {
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
  if (loading) return <div className="spc-loading">Loading…</div>;

  return (
    <div className="spc">
      {/* Header styled like StudentDetailsEdit */}
      <header className="spc-header">
        <div className="spc-header-left">
          <h1>Update Password</h1>
          <p className="spc-subtitle">Change your password.</p>
        </div>
        {/*<div className="spc-header-actions">
          <Link to={`/student/${id}/dashboard`} className="btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>*/}
      </header>

      <div className="spc-messages">
        {err && <div className="alert error">{err}</div>}
        {ok && <div className="alert success">{ok}</div>}
      </div>

      <section className="card spc-card">
        <form onSubmit={handleSubmit} className="spc-form" noValidate>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" value={email} disabled className="is-disabled" />
          </div>

          <div className="form-row">
            <label htmlFor="oldPwd">Current Password</label>
            <input
              id="oldPwd"
              type="password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-row">
            <label htmlFor="newPwd">New Password</label>
            <input
              id="newPwd"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Enter new password"
            />
            <small className="help-text">
              Min 6 chars with 1 uppercase, 1 lowercase, 1 number, 1 special character. 
            </small>
          </div>

          <div className="form-row">
            <label htmlFor="newPwd2">Confirm New Password</label>
            <input
              id="newPwd2"
              type="password"
              value={newPwd2}
              onChange={(e) => setNewPwd2(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="spc-actions">
            <button type="submit" className="btn btn-navy">
              Change Password
            </button>
            <Link to={`/student`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

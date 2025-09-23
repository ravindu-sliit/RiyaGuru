// src/pages/Student/StudentDetailsEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../services/api";

export default function StudentDetailsEdit() {
  const { id } = useParams(); // studentId
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const data = await apiFetch(`/api/students/${id}`);
        const s = data.student;
        setFullName(s.full_name || "");
        setPhone(s.phone || "");
        setGender(s.gender || "");
        setAddress(s.address || "");
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

    try {
      const body = {
        full_name,
        phone,
        gender,
        address,
      };
      const data = await apiFetch(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      setOk("Details updated.");
      setTimeout(() => navigate(`/student/${id}/dashboard`, { replace: true }), 700);
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Edit My Details</h2>
      <p><Link to={`/student/${id}/dashboard`}>&larr; Back to Dashboard</Link></p>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 8 }}>{ok}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 460 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Name</label>
          <input value={full_name} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: "100%" }}>
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ width: "100%" }} />
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

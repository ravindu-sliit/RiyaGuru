// src/pages/Student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";
import "../../styles/student-dashboard.css"; // <-- ensure this path exists

export default function StudentDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");
  const role = localStorage.getItem("rg_role");

  const [student, setStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    async function loadStudent() {
      if (!token) return;
      try {
        const data = await apiFetch(`/api/students/${id}`);
        setStudent(data.student);
      } catch (e) {
        setErr(e.message);
      }
    }
    async function loadDocs() {
      if (!token) return;
      try {
        const data = await apiFetch(`/api/docs/student/${id}`);
        setDocs(data.documents || []);
      } catch {
        /* ignore */
      }
    }
    loadStudent();
    loadDocs();
  }, [id, token]);

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Student") return <Navigate to="/home" replace />;

  async function uploadPic(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!file) {
      setErr("Please select an image file.");
      return;
    }

    const form = new FormData();
    form.append("profilePic", file);

    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Upload failed");

      setOk("Profile picture updated.");
      setFile(null);
      const data = await apiFetch(`/api/students/${id}`);
      setStudent(data.student);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteDoc(type) {
    setErr("");
    setOk("");
    try {
      const res = await fetch(`${API_BASE}/api/docs/student/${id}/type/${type}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Delete failed");
      setOk(`${type} deleted`);
      const data = await apiFetch(`/api/docs/student/${id}`);
      setDocs(data.documents || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/landing", { replace: true });
  }

  function handleReturnHome() {
    navigate("/home/student", { replace: true });
  }

  if (!student) return <div style={{ padding: 16 }}>Loading...</div>;

  const firstName = student.full_name?.split(" ")[0] || "Student";
  const avatarSrc = student.profilePicUrl || "/default-avatar.png";

  return (
    <div className="student-dashboard">
      {/* Header: avatar ABOVE details, all centered */}
      <header className="sd-header">
        <img
          src={avatarSrc}
          alt="Profile"
          className="sd-avatar"
          loading="lazy"
          decoding="async"
        />

        <h1 className="sd-greet">Hello {firstName}!</h1>

        {/* Student key details (slightly larger, centered) */}
        <ul className="sd-details">
          <li><b>Student ID:</b> {student.studentId}</li>
          <li><b>Name:</b> {student.full_name}</li>
          <li><b>NIC:</b> {student.nic}</li>
          <li><b>Phone:</b> {student.phone}</li>
          <li><b>Email:</b> {student.email}</li>
        </ul>

        {/* Primary actions directly beneath details */}
        <div className="sd-actions">
          <button
            className="btn btn-soft"
            onClick={() => navigate(`/student/${id}/edit`)}
          >
            Edit Details
          </button>
          <button
            className="btn btn-soft"
            onClick={() => navigate(`/student/${id}/password`)}
          >
            Change Password
          </button>
        </div>

        {/* Secondary utilities */}
        <div className="sd-utilities">
          <button className="btn btn-outline" onClick={handleReturnHome}>
            Return Home
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      {/* Alerts */}
      <div className="sd-messages">
        {err && <div className="alert error" role="alert">{err}</div>}
        {ok && <div className="alert success" role="status">{ok}</div>}
      </div>

      {/* Content grid */}
      <main className="sd-grid">
        {/* Profile Picture (upload/replace preview) */}
        <section className="card sd-card">
          <h3 className="card-title">Profile Picture</h3>

          <div className="sd-upload-preview">
            <img
              src={avatarSrc}
              alt="Current avatar"
              className="sd-avatar-sm"
              loading="lazy"
              decoding="async"
            />
            <div className="text-muted">Replace your profile picture:</div>
          </div>

          <form onSubmit={uploadPic} className="sd-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button className="btn btn-primary" type="submit">Upload</button>
          </form>
        </section>

        {/* Documents */}
        <section className="card sd-card">
          <div className="card-header">
            <h3 className="card-title">My Documents</h3>
            <Link to={`/student/${id}/docs/upload`}>
              <button className="btn btn-navy">Upload Documents</button>
            </Link>
          </div>

          {docs.length === 0 ? (
            <p className="text-muted">No documents uploaded yet.</p>
          ) : (
            <div className="sd-docs">
              {docs.map((d) => (
                <div key={d.docId} className="sd-doc">
                  <div className="sd-doc-title">{d.docType}</div>
                  <div className="sd-doc-images">
                    <img src={d.frontUrl} alt={`${d.docType} Front`} loading="lazy" />
                    <img src={d.backUrl} alt={`${d.docType} Back`} loading="lazy" />
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={() => deleteDoc(d.docType)}
                  >
                    Delete {d.docType}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Full info (kept for completeness) */}
        <section className="card sd-card">
          <h3 className="card-title">My Info</h3>
          <ul className="sd-info-list">
            <li><b>Student ID:</b> {student.studentId}</li>
            <li><b>Name:</b> {student.full_name}</li>
            <li><b>NIC:</b> {student.nic}</li>
            <li><b>Phone:</b> {student.phone}</li>
            <li><b>Birth Year:</b> {student.birthyear}</li>
            <li><b>Gender:</b> {student.gender}</li>
            <li><b>Address:</b> {student.address}</li>
            <li><b>Email:</b> {student.email}</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
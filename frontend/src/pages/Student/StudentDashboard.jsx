// src/pages/Student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";

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

  // Hooks must run unconditionally
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

  if (!student) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Student Dashboard</h1>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 8 }}>{ok}</div>}

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => navigate(`/student/${id}/edit`)}>Edit Details</button>
        <button onClick={() => navigate(`/student/${id}/password`)}>Change Password</button>
      </div>

      {/* Profile Picture */}
      <section style={{ marginBottom: 24 }}>
        <h3>Profile Picture</h3>
        {student.profilePicUrl ? (
          <>
            <img
              src={student.profilePicUrl}
              alt="Profile"
              style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
            />
            <p style={{ marginTop: 8 }}>Replace profile picture:</p>
            <form onSubmit={uploadPic}>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button style={{ marginLeft: 8 }} type="submit">Upload</button>
            </form>
          </>
        ) : (
          <>
            <p>No profile picture uploaded yet.</p>
            <form onSubmit={uploadPic}>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button style={{ marginLeft: 8 }} type="submit">Upload</button>
            </form>
          </>
        )}
      </section>

      {/* Documents */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>My Documents</h3>
          <Link to={`/student/${id}/docs/upload`}>
            <button>Upload Documents</button>
          </Link>
        </div>

        {docs.length === 0 ? (
          <p style={{ marginTop: 8 }}>No documents uploaded yet.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {docs.map((d) => (
              <div key={d.docId} style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{d.docType}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <img src={d.frontUrl} alt={`${d.docType} Front`} style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 4 }} />
                  <img src={d.backUrl} alt={`${d.docType} Back`} style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 4 }} />
                </div>
                <button style={{ marginTop: 10 }} onClick={() => deleteDoc(d.docType)}>
                  Delete {d.docType}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Student Info */}
      <section>
        <h3>My Info</h3>
        <ul>
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

        <Link to={`/student/${id}/preferences`}>
  <button style={{ marginTop: 10 }}>
    { /* if you later fetch and know exists */ }
    {/* prefExists ? "View Preferences" : "Select Preferences" */}
    Preferences
  </button>
</Link>


    </div>
  );
}

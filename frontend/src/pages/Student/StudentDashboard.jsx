// src/pages/Student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import ProgressHero from "../../components/ProgressHero";
import { User } from "lucide-react";
import "../../styles/student-dashboard.css";

export default function StudentDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");
  const role = localStorage.getItem("rg_role");

  const [student, setStudent] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

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
    loadStudent();
  }, [id, token]);

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Student") return <Navigate to="/home" replace />;

  if (!student) return <div className="sd-loading">Loading...</div>;

  const firstName = student.full_name?.split(" ")[0] || "Student";
  const rawAvatar = student.profilePicUrl || student.image || null;
  const safeAvatar = (() => {
    if (!rawAvatar) return null;
    const s = String(rawAvatar);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // backend serves files at localhost:5000, strip leading / if duplicated
    const base = "http://localhost:5000";
    return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
  })();

  return (
    <div className="min-h-screen bg-gray-50 student-surface">
      {/* Header: avatar LEFT, greeting + student ID on the RIGHT */}
      <div className="px-6 pt-6">
        {/* Constrain hero width to match profile card width (≈880px) */}
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 18px" }}>
        {(() => {
          const heroIcon = safeAvatar ? (
            <img
              src={safeAvatar}
              alt={`${firstName}'s profile`}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          );
          return (
            <ProgressHero
              title={`Hello ${firstName}!`}
              subtitle={`Student ID: ${student.studentId}`}
              icon={heroIcon}
              padY="py-10"
              iconContainerClass="w-16 h-16 bg-white bg-opacity-20 rounded-full overflow-hidden flex items-center justify-center"
            />
          );
        })()}
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="student-dashboard">
          <div className="sd-messages">
            {err && <div className="alert error" role="alert">{err}</div>}
            {ok && <div className="alert success" role="status">{ok}</div>}
          </div>

          {/* Single content card: Your Profile */}
          <main className="sd-main">
            <section className="card sd-info-card">
              <h3 className="card-title">Your Profile</h3>
              <ul className="sd-info-list">
                <li><b>Student ID</b><span>{student.studentId}</span></li>
                <li><b>Name</b><span>{student.full_name}</span></li>
                <li><b>NIC</b><span>{student.nic}</span></li>
                <li><b>Phone</b><span>{student.phone}</span></li>
                <li><b>Email</b><span>{student.email}</span></li>
                <li><b>Birth Year</b><span>{student.birthyear}</span></li>
                <li><b>Gender</b><span>{student.gender}</span></li>
                <li><b>Address</b><span>{student.address}</span></li>
              </ul>

              {/* Actions at the bottom (centered) */}
              <div className="sd-info-actions">
                <button
                  className="btn btn-soft"
                  onClick={() => navigate(`/student/${id}/edit`)}
                >
                  Edit Profile
                </button>
               {/* <button
                  className="btn btn-soft"
                  onClick={() => navigate(`/student/${id}/password`)}
                >
                  Change Password
                </button>  */}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// src/pages/Student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
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
  const avatarSrc = student.profilePicUrl || null;

  return (
    <div className="student-dashboard">
      {/* Header: avatar LEFT, greeting + student ID on the RIGHT */}
      <header className="sd-header sd-header-row">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`${firstName}'s profile`}
            className="sd-avatar"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="sd-avatar sd-avatar-empty"
            onClick={() => navigate(`/student/${id}/edit#profile-pic`)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/student/${id}/edit#profile-pic`);
              }
            }}
          >
            Click Here to Upload Image
          </div>
        )}
        <div className="sd-head-text">
          <h1 className="sd-greet">Hello {firstName}!</h1>
          <div className="sd-subline">
            Student ID: <b>{student.studentId}</b>
          </div>
        </div>
      </header>

      {/* Alerts */}
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
  );
}

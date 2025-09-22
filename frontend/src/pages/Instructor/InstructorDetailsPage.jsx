// src/pages/Instructor/InstructorDetailsPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";

// Import the modern CSS file
import "../../styles/InstructorDetails.css";

export default function InstructorDetailsPage() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.getById(id);
      setRec(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const printProfile = () => window.print();

  if (loading)
    return (
      <div className="inst-container">
        <div className="skeleton-lg" />
      </div>
    );

  if (!rec)
    return (
      <div className="inst-container">
        <p className="muted">Not found</p>
      </div>
    );

  // ✅ Build safe image URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const imageUrl = rec.image
    ? rec.image.startsWith("http")
      ? rec.image
      : `${API_URL}${rec.image}`
    : "/avatar.png";

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Instructor Profile</h1>
        <div className="inst-actions">
          <Link className="btn btn-soft" to={`/instructors/${id}/edit`}>
            📝 Edit
          </Link>
          <button className="btn btn-primary" onClick={printProfile}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </header>

      <div className="profile-card">
        {/* --- Left Side: Profile Image & Status --- */}
        <div className="profile-aside">
          <img
            className="profile-img"
            alt={rec.name}
            src={imageUrl}
            onError={(e) => {
              e.currentTarget.src = "/avatar.png";
            }}
          />
          <div className="status-line">
            <span
              className={`badge ${
                rec.status === "Active" ? "success" : "warn"
              }`}
            >
              {rec.status}
            </span>
          </div>
        </div>

        {/* --- Right Side: Profile Info --- */}
        <div className="profile-main">
          <h2>
            {rec.name}{" "}
            <span className="muted">({rec.instructorId || "N/A"})</span>
          </h2>

          <div className="grid-2">
            <div>
              <p>
                <strong>Email:</strong> {rec.email}
              </p>
              <p>
                <strong>Phone:</strong> {rec.phone}
              </p>
              <p>
                <strong>Address:</strong> {rec.address || "-"}
              </p>
              <p>
                <strong>License #:</strong> {rec.licenseNumber}
              </p>
            </div>
            <div>
              <p>
                <strong>Specialization:</strong> {rec.specialization}
              </p>
              <p>
                <strong>Experience:</strong> {rec.experienceYears} year(s)
              </p>
              <p>
                <strong>Rating:</strong>{" "}
                {rec.rating?.toFixed?.(1) ?? rec.rating ?? "-"}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(
                  rec.joinedDate || rec.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* --- Availability Section --- */}
          <div className="availability-wrap">
            <h3>Availability</h3>
            {rec.availability?.length ? (
              <ul className="availability-list">
                {rec.availability.map((a, idx) => (
                  <li key={idx}>
                    <span>{a.date}</span>
                    <span className="muted">
                      {(a.timeSlots || []).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No availability records.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/Student/StudentDetailsEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";
import "../../styles/student-details-edit.css";

export default function StudentDetailsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [currentPicUrl, setCurrentPicUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [deletePic, setDeletePic] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW: show “saved” modal after successful details save
  const [showSavedModal, setShowSavedModal] = useState(false);

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
        setEmail(s.email || "");
        setCurrentPicUrl(s.profilePicUrl || null);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSaveDetails(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      const detailsBody = { full_name, phone, gender, address, email };
      await apiFetch(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(detailsBody),
        headers: { "Content-Type": "application/json" },
      });

      const token = localStorage.getItem("rg_token");

      if (deletePic && currentPicUrl) {
        const delRes = await fetch(`${API_BASE}/api/students/${id}/profile-pic`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const delBody = await delRes.json().catch(() => ({}));
        if (!delRes.ok) throw new Error(delBody.message || "Failed to delete profile picture");
        setCurrentPicUrl(null);
      }

      setFile(null);
      setDeletePic(false);
      setOk("Details saved.");
      // Show modal instead of redirecting
      setShowSavedModal(true);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleUploadPic(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!file) {
      setErr("Please select an image file.");
      return;
    }

    try {
      const token = localStorage.getItem("rg_token");
      const form = new FormData();
      form.append("profilePic", file);

      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Upload failed");

      const data = await apiFetch(`/api/students/${id}`);
      setCurrentPicUrl(data.student?.profilePicUrl || null);
      setFile(null);
      setOk("Profile picture updated.");
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) return <div className="sde-loading">Loading…</div>;

  return (
    <div className="sde">
      <header className="sde-header">
        <div className="sde-header-left">
          <h1>Profile Settings</h1>
          <p className="sde-subtitle">
            Update your personal details and manage your profile picture.
          </p>
        </div>
        <div className="sde-header-actions">
          <Link to={`/student/${id}/dashboard`} className="btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="sde-messages">
        {err && (
          <div className="alert error" role="alert" aria-live="assertive">
            {err}
          </div>
        )}
        {ok && (
          <div className="alert success" role="status" aria-live="polite">
            {ok}
          </div>
        )}
      </div>

      <section className="card sde-card-single">
        <h3 className="card-title">Personal Details</h3>

        <form onSubmit={handleSaveDetails} className="sde-form">
          <div className="form-row">
            <label htmlFor="full_name">Name</label>
            <input
              id="full_name"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="form-row">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 0771234567"
            />
          </div>

          <div className="form-row">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City"
            />
          </div>

          <div className="sde-divider" />
          <h3 className="card-title sde-subtitle-title">Profile Picture</h3>

          <div className="sde-pic">
            {currentPicUrl ? (
              <>
                <img
                  src={currentPicUrl}
                  alt="Profile"
                  className="sde-pic-preview"
                />
                <div className="sde-muted">
                  Choose a new file to replace your current photo.
                </div>
              </>
            ) : (
              <div className="sde-empty-pic">
                <div className="sde-avatar-placeholder">No Photo</div>
                <div className="sde-muted">
                  You haven’t uploaded a photo yet. Choose a file to add one.
                </div>
              </div>
            )}
          </div>

          <div className="sde-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUploadPic}
            >
              Upload Photo
            </button>
          </div>

          <label className="sde-checkbox">
            <input
              type="checkbox"
              checked={deletePic}
              onChange={(e) => setDeletePic(e.target.checked)}
              disabled={!currentPicUrl}
            />
            <span>Delete current profile picture</span>
          </label>

          <div className="sde-actions">
            <button type="submit" className="btn btn-navy">
              Save Changes
            </button>
            <Link to={`/student/${id}/dashboard`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </section>

      {/* Saved Modal */}
      {showSavedModal && (
        <div className="sde-modal-overlay" role="dialog" aria-modal="true">
          <div className="sde-modal">
            <h4 className="sde-modal-title">Changes saved</h4>
            <p className="sde-modal-text">
              Your profile details have been updated successfully.
            </p>
            <button
              type="button"
              className="btn btn-navy sde-modal-cta"
              onClick={() => navigate(`/student/${id}/dashboard`, { replace: true })}
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              className="link-btn sde-modal-stay"
              onClick={() => setShowSavedModal(false)}
            >
              Stay on Edit Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

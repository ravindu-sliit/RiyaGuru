// src/pages/Student/StudentDetailsEdit.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";
import "../../styles/student-details-edit.css";

export default function StudentDetailsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // unified inputs + validation
  const [inputs, setInputs] = useState({
    full_name: "",
    phone: "",
    gender: "",
    address: "",
    email: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  // picture state
  const [currentPicUrl, setCurrentPicUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [deletePic, setDeletePic] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  // modal state
  const [showSavedModal, setShowSavedModal] = useState(false);

  // anchor/ref for smooth scroll to profile picture section
  const picSectionRef = useRef(null);

  // validation
  const EMAIL_RE =
    /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$/;

  const validators = {
    full_name: (v) => {
      if (!String(v ?? "").trim()) return "Full name is required";
      return /^[A-Za-z ]+$/.test(String(v).trim())
        ? ""
        : "Only English letters (and spaces) are allowed";
    },
    phone: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Phone number is required";
      return /^(0\d{9}|\d{9})$/.test(val)
        ? ""
        : "Enter 9 digits (or 0 followed by 9 digits)";
    },
    email: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Email is required";
      return EMAIL_RE.test(val)
        ? ""
        : "Enter a valid email address (letters only after the final dot)";
    },
    gender: () => "",
    address: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Address is required";
      if (val.length < 5) return "Address is too short";
      return /^[A-Za-z0-9\s,.\-/#]+$/.test(val)
        ? ""
        : "Address contains invalid characters";
    },
  };

  const fieldOrder = ["full_name", "phone", "email", "gender", "address"];

  const validateField = (name, value, all = inputs) => {
    const fn = validators[name];
    return fn ? fn(value, all) : "";
  };

  const validateAll = (vals) => {
    const next = {};
    for (const f of fieldOrder) {
      const msg = validateField(f, vals[f] ?? "", vals);
      if (msg) next[f] = msg;
    }
    return next;
  };

  const a11y = (name) => ({
    "aria-invalid": !!(touched[name] && errors[name]),
    "aria-describedby":
      touched[name] && errors[name] ? `${name}-error` : undefined,
    "data-valid":
      touched[name] ? (errors[name] ? "false" : "true") : undefined,
  });

  const FieldError = ({ name }) =>
    touched[name] && errors[name] ? (
      <div
        id={`${name}-error`}
        className="field-error"
        role="alert"
        aria-live="assertive"
      >
        {errors[name]}
      </div>
    ) : null;

  // load data
  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const data = await apiFetch(`/api/students/${id}`);
        const s = data.student || {};
        setInputs({
          full_name: s.full_name || "",
          phone: s.phone || "",
          gender: s.gender || "",
          address: s.address || "",
          email: s.email || "",
        });
        setCurrentPicUrl(s.profilePicUrl || null);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // if URL hash is #profile-pic, smooth-scroll to that section after load
  useEffect(() => {
    if (!loading && location.hash === "#profile-pic" && picSectionRef.current) {
      // give the browser a tick to render before scrolling
      requestAnimationFrame(() => {
        picSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        // Optional: move focus for accessibility
        picSectionRef.current.focus?.();
      });
    }
  }, [loading, location.hash]);

  // handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    setErrors((prev) => {
      const all = { ...inputs, [name]: value };
      const next = { ...prev };
      const msg = validateField(name, value, all);
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((prev) => {
      const msg = validateField(name, inputs[name] ?? "", inputs);
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  async function handleSaveDetails(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    setSubmitError("");

    const nextErrors = validateAll(inputs);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(fieldOrder.map((f) => [f, true])));

    if (Object.keys(nextErrors).length) {
      for (const name of fieldOrder) {
        if (nextErrors[name]) {
          const el = document.getElementById(name);
          el?.focus?.();
          break;
        }
      }
      return;
    }

    setSubmitting(true);
    try {
      const detailsBody = {
        full_name: inputs.full_name.trim(),
        phone: inputs.phone.trim(),
        gender: inputs.gender,
        address: inputs.address.trim(),
        email: inputs.email.trim().toLowerCase(),
      };

      await apiFetch(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(detailsBody),
        headers: { "Content-Type": "application/json" },
      });

      // delete picture if requested
      const token = localStorage.getItem("rg_token");
      if (deletePic && currentPicUrl) {
        const delRes = await fetch(`${API_BASE}/api/students/${id}/profile-pic`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const delBody = await delRes.json().catch(() => ({}));
        if (!delRes.ok)
          throw new Error(delBody.message || "Failed to delete profile picture");
        setCurrentPicUrl(null);
      }

      setFile(null);
      setDeletePic(false);
      setOk("Details saved.");
      setShowSavedModal(true);
    } catch (e) {
      const msg = e?.message || "Failed to save details";
      setErr(msg);
      setSubmitError(msg);
      const lower = msg.toLowerCase();
      if (lower.includes("email")) emailRef.current?.focus();
      else if (lower.includes("phone")) phoneRef.current?.focus();
    } finally {
      setSubmitting(false);
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
          <p className="sde-subtitle">Update your profile.</p>
        </div>
        {/* Keeping actions empty for consistency with other pages */}
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
        {submitError && (
          <div className="submit-error" role="alert" aria-live="assertive">
            {submitError}
          </div>
        )}
      </div>

      <section className="card sde-card-single">
        <h3 className="card-title">Personal Details</h3>

        <form onSubmit={handleSaveDetails} className="sde-form" noValidate>
          <div className="form-row">
            <label htmlFor="full_name">Name</label>
            <input
              id="full_name"
              name="full_name"
              value={inputs.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your full name"
              {...a11y("full_name")}
            />
            <FieldError name="full_name" />
          </div>

          <div className="form-row">
            <label htmlFor="phone">Phone</label>
            <input
              ref={phoneRef}
              id="phone"
              name="phone"
              value={inputs.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 0771234567"
              inputMode="numeric"
              {...a11y("phone")}
            />
            <FieldError name="phone" />
          </div>

          <div className="form-row">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={inputs.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              {...a11y("gender")}
            >
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
              <option>Other</option>
            </select>
            <FieldError name="gender" />
          </div>

          <div className="form-row">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={inputs.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Street, City, Country or Region"
              {...a11y("address")}
            />
            <FieldError name="address" />
          </div>

          {/* ----------- Profile Picture section anchor ----------- */}
          <div className="sde-divider" />

          {/* This wrapper has the id used by the dashboard link (#profile-pic).
              It also holds a ref so we can scroll into view smoothly. */}
          <div
            id="profile-pic"
            ref={picSectionRef}
            tabIndex={-1}
            style={{ outline: "none" }}
          >
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
          </div>
          {/* --------- end Profile Picture section anchor --------- */}

          <div className="sde-actions">
            <button type="submit" className="btn btn-navy" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
            <Link to={`/student/${id}/dashboard`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </section>

      {/* Save Changes Success */}
      {showSavedModal && (
        <div className="sde-modal-overlay" role="dialog" aria-modal="true">
          <div className="sde-modal sde-modal-success">
            <div className="sde-check">
              {/* inline SVG check inside a soft green ring */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="ring" />
                <path d="M7 12.5l3.2 3.2L17 9" className="tick" />
              </svg>
            </div>
            <h4 className="sde-modal-title">Changes Saved</h4>
            <p className="sde-modal-text">Your profile was updated successfully.</p>
            <button
              type="button"
              className="btn btn-success sde-modal-cta"
              onClick={() =>
                navigate(`/student/${id}/dashboard`, { replace: true })
              }
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              className="link-btn sde-modal-stay"
              onClick={() => setShowSavedModal(false)}
            >
              Stay on this Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

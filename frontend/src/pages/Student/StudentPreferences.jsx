// src/pages/Student/StudentPreferences.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_BASE } from "../../services/api";
import "../../styles/student-preferences.css";

const VEHICLE_TYPES = ["Car", "Motorcycle", "ThreeWheeler"];
const SCHEDULES = ["Weekday", "Weekend"];

export default function StudentPreferences() {
  const { id } = useParams(); // studentId from the URL
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");
  const role = localStorage.getItem("rg_role");

  // form state
  const [vehicleCategory, setVehicleCategory] = useState("Light");
  const [vehicleType, setVehicleType] = useState([]); // array when Light
  const [schedulePref, setSchedulePref] = useState("Weekday");

  // load/display state
  const [loading, setLoading] = useState(true);
  const [prefExists, setPrefExists] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // success modal (like StudentDetailsEdit)
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Guard: must be a logged-in Student
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (role !== "Student") {
      navigate("/home", { replace: true });
      return;
    }
  }, [token, role, navigate]);

  // Load existing preference (if any)
  useEffect(() => {
    let ignore = false;
    async function load() {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/preferences/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          if (!ignore) {
            setPrefExists(false);
            setLoading(false);
          }
          return;
        }
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);

        const p = body.preference;
        if (!ignore && p) {
          setPrefExists(true);
          setVehicleCategory(p.vehicleCategory || "Light");
          setVehicleType(Array.isArray(p.vehicleType) ? p.vehicleType : []);
          setSchedulePref(p.schedulePref || "Weekday");
          setLoading(false);
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load preference");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id, token]);

  const isHeavy = vehicleCategory === "Heavy";
  const canSubmit = useMemo(() => {
    if (isHeavy) return !!schedulePref; // backend auto-sets ["Heavy"]
    return vehicleType.length > 0 && !!schedulePref;
  }, [isHeavy, vehicleType, schedulePref]);

  function toggleType(t) {
    setVehicleType((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!canSubmit) {
      setError(
        isHeavy
          ? "Please choose a schedule."
          : "Please select at least one vehicle type and a schedule."
      );
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload =
        vehicleCategory === "Heavy"
          ? { vehicleCategory: "Heavy", schedulePref }
          : { vehicleCategory: "Light", vehicleType, schedulePref };

      let res, body;
      if (prefExists) {
        // UPDATE
        res = await fetch(`${API_BASE}/api/preferences/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
        body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
        setOk(body.message || "Preferences updated.");
      } else {
        // CREATE
        res = await fetch(`${API_BASE}/api/preferences`, {
          method: "POST",
          headers,
          body: JSON.stringify({ studentId: id, ...payload }),
        });
        body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
        setOk(body.message || "Preferences saved.");
      }

      // Instead of auto-redirect, show success modal like other pages
      setShowSavedModal(true);
    } catch (e) {
      setError(e.message || "Save failed");
    }
  }

  if (loading) return <div className="spf-loading">Loading…</div>;

  return (
    <div className="spf">
      {/* Header — same pattern as other pages */}
      <header className="spf-header">
        <div className="spf-header-left">
          <h1>{prefExists ? "Edit Preferences" : "Select Preferences"}</h1>
          <p className="spf-subtitle">
            Choose your vehicle category, types, and preferred schedule.
          </p>
        </div>
      </header>

      {/* Alerts */}
      <div className="spf-messages">
        {error && (
          <div className="alert error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {ok && (
          <div className="alert success" role="status" aria-live="polite">
            {ok}
          </div>
        )}
      </div>

      {/* Card */}
      <section className="card spf-card">
        {/* Current summary (if exists) */}
        {prefExists && (
          <div className="spf-summary">
            <b>Current Preference</b>
            <div>Category: {vehicleCategory}</div>
            <div>
              Vehicle Type: {isHeavy ? "Heavy" : vehicleType.join(", ") || "-"}
            </div>
            <div>Schedule: {schedulePref}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="spf-form" noValidate>
          {/* Category (only when creating) */}
          {!prefExists && (
            <fieldset className="spf-fieldset">
              <legend>Vehicle Category</legend>

              <label className="spf-radio">
                <input
                  type="radio"
                  name="vehicleCategory"
                  value="Light"
                  checked={vehicleCategory === "Light"}
                  onChange={() => setVehicleCategory("Light")}
                />
                <span>Light</span>
              </label>

              <label className="spf-radio">
                <input
                  type="radio"
                  name="vehicleCategory"
                  value="Heavy"
                  checked={vehicleCategory === "Heavy"}
                  onChange={() => {
                    setVehicleCategory("Heavy");
                    setVehicleType([]);
                  }}
                />
                <span>Heavy</span>
              </label>
            </fieldset>
          )}

          {/* Vehicle Types (Light only) */}
          {vehicleCategory === "Light" && (
            <fieldset className="spf-fieldset">
              <legend>Vehicle Types (select one or more)</legend>
              <div className="spf-checkboxes">
                {VEHICLE_TYPES.map((t) => (
                  <label key={t} className="spf-checkbox">
                    <input
                      type="checkbox"
                      checked={vehicleType.includes(t)}
                      onChange={() => toggleType(t)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Schedule (always) */}
          <fieldset className="spf-fieldset">
            <legend>Preferred Schedule</legend>
            <select
              className="spf-select"
              value={schedulePref}
              onChange={(e) => setSchedulePref(e.target.value)}
            >
              {SCHEDULES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </fieldset>

          <div className="spf-actions">
            <button type="submit" className="btn btn-navy" disabled={!canSubmit}>
              {prefExists ? "Update Preferences" : "Save Preferences"}
            </button>
            <Link to={`/student`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </section>

      {/* Save Success Modal — same look/feel as StudentDetailsEdit */}
      {showSavedModal && (
        <div className="spf-modal-overlay" role="dialog" aria-modal="true">
          <div className="spf-modal spf-modal-success">
            <div className="spf-check">
              {/* inline SVG check inside a soft green ring */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="ring" />
                <path d="M7 12.5l3.2 3.2L17 9" className="tick" />
              </svg>
            </div>
            <h4 className="spf-modal-title">Preferences Saved</h4>
            <p className="spf-modal-text">
              Your preferences have been updated successfully.
            </p>
            <button
              type="button"
              className="btn btn-success spf-modal-cta"
              onClick={() => navigate(`/student`, { replace: true })}
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              className="link-btn spf-modal-stay"
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

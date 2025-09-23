// src/pages/Student/StudentPreferences.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_BASE } from "../../services/api";

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

      // Redirect to dashboard
      setTimeout(() => {
        navigate(`/student/${id}/dashboard`, { replace: true });
      }, 600);
    } catch (e) {
      setError(e.message || "Save failed");
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h2>{prefExists ? "Edit Preferences" : "Select Preferences"}</h2>
      <p>
        <Link to={`/student/${id}/dashboard`}>&larr; Back to Dashboard</Link>
      </p>

      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      {ok && <div style={{ color: "seagreen", marginBottom: 8 }}>{ok}</div>}

      {/* Summary if pref exists */}
      {prefExists && (
        <div
          style={{
            background: "#f7f7f7",
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <b>Current Preference</b>
          <div>Category: {vehicleCategory}</div>
          <div>
            Vehicle Type: {isHeavy ? "Heavy" : vehicleType.join(", ") || "-"}
          </div>
          <div>Schedule: {schedulePref}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Category selection: only when creating */}
        {!prefExists && (
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Vehicle Category
            </label>

            <label style={{ marginRight: 16 }}>
              <input
                type="radio"
                name="vehicleCategory"
                value="Light"
                checked={vehicleCategory === "Light"}
                onChange={() => setVehicleCategory("Light")}
              />
              <span style={{ marginLeft: 6 }}>Light</span>
            </label>

            <label>
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
              <span style={{ marginLeft: 6 }}>Heavy</span>
            </label>
          </div>
        )}

        {/* Vehicle types (Light only, and editable if Light) */}
        {vehicleCategory === "Light" && (
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Vehicle Types (select one or more)
            </label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {VEHICLE_TYPES.map((t) => (
                <label key={t} style={{ minWidth: 160 }}>
                  <input
                    type="checkbox"
                    checked={vehicleType.includes(t)}
                    onChange={() => toggleType(t)}
                    disabled={isHeavy} // lock if heavy
                  />
                  <span style={{ marginLeft: 6 }}>{t}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Schedule always editable */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Preferred Schedule
          </label>
          <select
            value={schedulePref}
            onChange={(e) => setSchedulePref(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            {SCHEDULES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={!canSubmit}>
          {prefExists ? "Update Preferences" : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}

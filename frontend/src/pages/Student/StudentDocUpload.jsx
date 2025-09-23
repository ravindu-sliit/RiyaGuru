// src/pages/Student/StudentDocUpload.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../services/api";

export default function StudentDocUpload() {
  const { id } = useParams(); // studentId
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");

  // preference
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);

  // files
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        // GET preference by studentId
        const data = await apiFetch(`/api/preferences/${id}`);
        setPref(data.preference);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    const isLight = pref?.vehicleCategory === "Light";
    const isHeavy = pref?.vehicleCategory === "Heavy";

    // make sure the correct files are present before posting
    if (isLight) {
      if (!nicFront || !nicBack) {
        setErr("For Light category, NIC front and back are required.");
        return;
      }
    } else if (isHeavy) {
      const hasNIC = nicFront || nicBack;
      const hasDL = dlFront || dlBack;
      if (!hasNIC && !hasDL) {
        setErr("For Heavy category, upload NIC and/or Driver License.");
        return;
      }
      if (hasNIC && (!nicFront || !nicBack)) {
        setErr("If you upload NIC, both NIC front and back are required.");
        return;
      }
      if (hasDL && (!dlFront || !dlBack)) {
        setErr("If you upload Driver License, both front and back are required.");
        return;
      }
    } else {
      setErr("Preference not found. Please set your preference first.");
      return;
    }

    const form = new FormData();
    form.append("studentId", id);
    if (nicFront) form.append("nicFront", nicFront);
    if (nicBack) form.append("nicBack", nicBack);
    if (dlFront) form.append("dlFront", dlFront);
    if (dlBack) form.append("dlBack", dlBack);

    try {
      const res = await fetch(`${API_BASE}/api/docs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Upload failed");

      setOk(body.message || "Uploaded");
      // redirect back to dashboard after short delay
      setTimeout(() => navigate(`/student/${id}/dashboard`, { replace: true }), 600);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Upload Documents</h2>
      <p>
        <Link to={`/student/${id}/dashboard`}>&larr; Back to Dashboard</Link>
      </p>

      {loading && <div>Loading preference…</div>}
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 8 }}>{ok}</div>}

      {pref && (
        <>
          <div style={{ marginBottom: 12 }}>
            <b>Vehicle Category:</b> {pref.vehicleCategory}
          </div>

          <form onSubmit={handleSubmit}>
            {/* NIC block */}
            <fieldset style={{ marginBottom: 16 }}>
              <legend>NIC (front & back)</legend>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <label>NIC Front</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNicFront(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label>NIC Back</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNicBack(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              {pref.vehicleCategory === "Light" && (
                <p style={{ marginTop: 6, color: "#555" }}>
                  Light category: only NIC is allowed.
                </p>
              )}
            </fieldset>

            {/* Driver License block (not shown as required for Light) */}
            {pref.vehicleCategory === "Heavy" && (
              <fieldset style={{ marginBottom: 16 }}>
                <legend>Driver License (front & back)</legend>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <label>License Front</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDlFront(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label>License Back</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDlBack(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <p style={{ marginTop: 6, color: "#555" }}>
                  Heavy category: you can upload both NIC and Driver License, or add the License later.
                </p>
              </fieldset>
            )}

            <button type="submit">Upload</button>
          </form>
        </>
      )}
    </div>
  );
}

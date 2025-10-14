// src/pages/Student/StudentDocUpload.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import ProgressHero from "../../components/ProgressHero";
import { apiFetch, API_BASE } from "../../services/api";
import "../../styles/student-doc-upload.css";

export default function StudentDocUpload() {
  const { id } = useParams(); // studentId
  const navigate = useNavigate();
  const token = localStorage.getItem("rg_token");

  const [pref, setPref] = useState(null);
  const [docs, setDocs] = useState([]); // [{docType, frontUrl, backUrl}]
  const [loading, setLoading] = useState(true);

  // NIC files
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);

  // Driver License files
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      setLoading(true);
      try {
        const [prefRes, docsRes] = await Promise.all([
          apiFetch(`/api/preferences/${id}`),
          apiFetch(`/api/docs/student/${id}`).catch(() => ({ documents: [] })),
        ]);
        setPref(prefRes.preference);
        setDocs(docsRes.documents || []);
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

  const refreshDocs = async () => {
    const docRes = await apiFetch(`/api/docs/student/${id}`).catch(() => ({ documents: [] }));
    setDocs(docRes.documents || []);
  };

  const getDoc = (type) =>
    docs.find((d) => String(d.docType).toLowerCase() === String(type).toLowerCase());

  async function uploadNIC() {
    setErr("");
    setOk("");
    if (!nicFront || !nicBack) {
      setErr("Please choose both NIC Front and NIC Back.");
      return;
    }
    try {
      const form = new FormData();
      form.append("studentId", id);
      form.append("nicFront", nicFront);
      form.append("nicBack", nicBack);

      const res = await fetch(`${API_BASE}/api/docs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "NIC upload failed");

      setOk(body.message || "NIC uploaded.");
      setNicFront(null);
      setNicBack(null);
      await refreshDocs();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteNIC() {
    setErr("");
    setOk("");
    try {
      const res = await fetch(`${API_BASE}/api/docs/student/${id}/type/NIC`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Delete NIC failed");
      setOk("NIC deleted.");
      await refreshDocs();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function uploadDL() {
    setErr("");
    setOk("");
    if (!dlFront || !dlBack) {
      setErr("Please choose both License Front and License Back.");
      return;
    }
    try {
      const form = new FormData();
      form.append("studentId", id);
      form.append("dlFront", dlFront);
      form.append("dlBack", dlBack);

      const res = await fetch(`${API_BASE}/api/docs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Driver License upload failed");

      setOk(body.message || "Driver License uploaded.");
      setDlFront(null);
      setDlBack(null);
      await refreshDocs();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteDL() {
    setErr("");
    setOk("");
    try {
      const res = await fetch(`${API_BASE}/api/docs/student/${id}/type/Driver_License`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Delete Driver License failed");
      setOk("Driver License deleted.");
      await refreshDocs();
    } catch (e) {
      setErr(e.message);
    }
  }

  const nicDoc = getDoc("NIC");
  const dlDoc = getDoc("Driver_License");
  const isLight = pref?.vehicleCategory === "Light";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — match MyEnrollments */}
      <div className="px-6 pt-6">
        <ProgressHero
          title="My Documents"
          subtitle={pref?.vehicleCategory ? `Vehicle Category: ${pref.vehicleCategory}` : "Set your preference to see required documents."}
          icon={<BookOpen className="w-8 h-8 text-white" />}
        />
      </div>

      {/* Content */}
      <div className="px-6 py-8">
      <div className="sdu-messages">
        {loading && <div className="alert info">Loading…</div>}
        {err && <div className="alert error" role="alert">{err}</div>}
        {ok && <div className="alert success" role="status">{ok}</div>}
      </div>

      {/* NIC Row */}
      <section className="card sdu-row">
        <div className="sdu-row-title">
          <h3 className="card-title">NIC</h3>
          {nicDoc && (
            <button type="button" className="btn btn-danger" onClick={deleteNIC}>
              Delete NIC
            </button>
          )}
        </div>

        <div className="sdu-row-grid">
          {/* Left: preview slots */}
          <div className="sdu-preview">
            {/* Front slot */}
            <div className="sdu-slot">
              <div className="sdu-slot-label">Front</div>
              {nicDoc?.frontUrl ? (
                <img src={nicDoc.frontUrl} alt="NIC Front" />
              ) : (
                <div className="sdu-slot-empty">No image</div>
              )}
            </div>
            {/* Back slot */}
            <div className="sdu-slot">
              <div className="sdu-slot-label">Back</div>
              {nicDoc?.backUrl ? (
                <img src={nicDoc.backUrl} alt="NIC Back" />
              ) : (
                <div className="sdu-slot-empty">No image</div>
              )}
            </div>
          </div>

          {/* Right: file pickers + upload */}
          <div className="sdu-controls">
            <div className="input-block">
              <label>NIC Front</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNicFront(e.target.files?.[0] || null)}
              />
            </div>
            <div className="input-block">
              <label>NIC Back</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNicBack(e.target.files?.[0] || null)}
              />
            </div>
            <div className="sdu-actions-right">
              <button type="button" className="btn btn-navy" onClick={uploadNIC}>
                Upload NIC
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Driver License Row (hidden for Light) */}
      {!isLight && (
        <section className="card sdu-row">
          <div className="sdu-row-title">
            <h3 className="card-title">DRIVING LICENCE</h3>
            {dlDoc && (
              <button type="button" className="btn btn-danger" onClick={deleteDL}>
                Delete Licence
              </button>
            )}
          </div>

          <div className="sdu-row-grid">
            {/* Left: preview slots */}
            <div className="sdu-preview">
              <div className="sdu-slot">
                <div className="sdu-slot-label">Front</div>
                {dlDoc?.frontUrl ? (
                  <img src={dlDoc.frontUrl} alt="License Front" />
                ) : (
                  <div className="sdu-slot-empty">No image</div>
                )}
              </div>
              <div className="sdu-slot">
                <div className="sdu-slot-label">Back</div>
                {dlDoc?.backUrl ? (
                  <img src={dlDoc.backUrl} alt="License Back" />
                ) : (
                  <div className="sdu-slot-empty">No image</div>
                )}
              </div>
            </div>

            {/* Right: file pickers + upload */}
            <div className="sdu-controls">
              <div className="input-block">
                <label>Licence Front</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDlFront(e.target.files?.[0] || null)}
                />
              </div>
              <div className="input-block">
                <label>Licence Back</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDlBack(e.target.files?.[0] || null)}
                />
              </div>
              <div className="sdu-actions-right">
                <button type="button" className="btn btn-navy" onClick={uploadDL}>
                  Upload Licence
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

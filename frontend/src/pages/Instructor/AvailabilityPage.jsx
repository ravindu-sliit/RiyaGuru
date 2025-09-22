// src/pages/Instructor/AvailabilityPage.jsx
import { useEffect, useState } from "react";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

export default function AvailabilityPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.availability({ date, time });
      setRows(data);
    } finally { setLoading(false); }
  };

  // Auto-load all when empty (backend returns all instructors if no date/time)
  useEffect(() => { query(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Instructor Availability</h1>
      </header>

      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input className="input" placeholder="HH:MM-HH:MM" value={time} onChange={e => setTime(e.target.value)} />
        <button className="btn btn-primary" onClick={query} disabled={loading}>{loading ? "Checking..." : "Check"}</button>
      </div>

      {loading ? <div className="skeleton-lg" /> : (
        <div className="cards-grid">
          {rows.map((r) => (
            <div key={r.instructorId} className="mini-card">
              <div className="mini-title">{r.name}</div>
              <div className="mini-sub">{r.instructorId}</div>
              <div className="mini-kv"><span>Spec:</span><span>{r.specialization}</span></div>
              <div className="mini-kv"><span>Phone:</span><span>{r.phone || "-"}</span></div>
              <div className="mini-kv"><span>Status:</span><span className={`badge ${r.status === "Active" ? "success" : "warn"}`}>{r.status}</span></div>
            </div>
          ))}
          {rows.length === 0 && <p className="muted">No available instructors.</p>}
        </div>
      )}
    </div>
  );
}

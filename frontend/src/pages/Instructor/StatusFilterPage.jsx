// src/pages/Instructor/StatusFilterPage.jsx
import { useEffect, useState } from "react";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

export default function StatusFilterPage() {
  const [status, setStatus] = useState("Active");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.byStatus(status);
      setRows(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Filter by Status</h1>
      </header>

      <div className="toolbar">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Active">Active</option>
          <option value="Not-Active">Not-Active</option>
        </select>
        <button className="btn btn-soft" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
      </div>

      {loading ? <div className="skeleton-lg" /> : (
        <ul className="simple-list">
          {rows.map((r) => (
            <li key={r.instructorId}>
              <span className="list-title">{r.name}</span>
              <span className="list-sub">{r.instructorId} • {r.specialization}</span>
            </li>
          ))}
          {rows.length === 0 && <li className="muted">No instructors in this state.</li>}
        </ul>
      )}
    </div>
  );
}

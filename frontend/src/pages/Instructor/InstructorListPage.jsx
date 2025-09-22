// src/pages/Instructor/InstructorListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

const headers = [
  { key: "instructorId", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "specialization", label: "Specialization" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

export default function InstructorListPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [sortKey, setSortKey] = useState("instructorId");
  const [asc, setAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.getAll();
      setRows(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRows(); }, []);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (q) {
      const k = q.toLowerCase();
      list = list.filter(r =>
        [r.instructorId, r.name, r.email, r.phone, r.specialization]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(k))
      );
    }
    if (spec !== "All") list = list.filter(r => r.specialization === spec);
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, q, spec, sortKey, asc]);

  const exportCSV = () => {
    const header = ["ID,Name,Email,Phone,Specialization,Status"];
    const body = filtered.map(r => [r.instructorId, r.name, r.email, r.phone, r.specialization, r.status]
      .map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([header.concat(body).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "instructors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = async (rec) => {
    const next = rec.status === "Active" ? "Not-Active" : "Active";
    await InstructorAPI.toggleStatus(rec._id || rec.id, next);
    fetchRows();
  };

  const remove = async (rec) => {
    if (!window.confirm(`Delete ${rec.name}? This also deletes linked User.`)) return;
    await InstructorAPI.remove(rec._id || rec.id);
    fetchRows();
  };

  const onSort = (key) => {
    if (key === "actions") return;
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(true); }
  };

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>All Instructors</h1>
        <div className="inst-actions">
          <Link className="btn btn-primary" to="/instructors/add">+ Add</Link>
          <button className="btn btn-soft" onClick={exportCSV}>Export CSV</button>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name, email, phone…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select className="select" value={spec} onChange={e => setSpec(e.target.value)}>
          <option value="All">All specializations</option>
          <option value="Car">Car</option>
          <option value="Motorcycle">Motorcycle</option>
          <option value="Threewheeler">Threewheeler</option>
          <option value="HeavyVehicle">HeavyVehicle</option>
        </select>
      </div>

      {loading ? <div className="skeleton-lg" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h.key} onClick={() => onSort(h.key)}>
                    {h.label}{sortKey === h.key ? (asc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id || r.id} className="hover">
                  <td>{r.instructorId}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.specialization}</td>
                  <td>
                    <span className={`badge ${r.status === "Active" ? "success" : "warn"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="btn btn-mini" onClick={() => nav(`/instructors/${r._id || r.id}`)}>View</button>
                    <button className="btn btn-mini" onClick={() => nav(`/instructors/${r._id || r.id}/edit`)}>Edit</button>
                    <button className="btn btn-mini" onClick={() => toggleStatus(r)}>
                      {r.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button className="btn btn-mini danger" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={headers.length} className="muted">No instructors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

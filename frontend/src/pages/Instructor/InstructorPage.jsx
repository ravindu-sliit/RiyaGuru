// src/pages/Instructor/InstructorPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

export default function InstructorPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, car: 0, moto: 0, three: 0, heavy: 0, all: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await InstructorAPI.getAll();
        const total = data.length;
        const active = data.filter(i => i.status === "Active").length;
        const inactive = total - active;
        const bySpec = (k) => data.filter(i => i.specialization === k).length;
        setStats({
          total, active, inactive,
          car: bySpec("Car"),
          moto: bySpec("Motorcycle"),
          three: bySpec("Threewheeler"),
          heavy: bySpec("HeavyVehicle"),
          all: bySpec("All"),
        });
      } finally { setLoading(false); }
    })();
  }, []);

  const cards = useMemo(() => ([
    { label: "Total Instructors", value: stats.total },
    { label: "Active", value: stats.active },
    { label: "Not-Active", value: stats.inactive },
    { label: "Car", value: stats.car },
    { label: "Motorcycle", value: stats.moto },
    { label: "Threewheeler", value: stats.three },
    { label: "Heavy Vehicle", value: stats.heavy },
    { label: "All (Multi-skill)", value: stats.all },
  ]), [stats]);

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Instructors</h1>
        <div className="inst-actions">
          <Link className="btn btn-primary" to="/instructors/add">+ Add Instructor</Link>
          <Link className="btn btn-soft" to="/instructors/list">View List</Link>
          <Link className="btn btn-soft" to="/instructors/availability">Availability</Link>
          <Link className="btn btn-soft" to="/instructors/status">Filter by Status</Link>
        </div>
      </header>

      {loading ? <div className="skeleton-lg" /> : (
        <div className="stat-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card">
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

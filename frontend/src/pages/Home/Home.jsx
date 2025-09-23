// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("rg_userId");
    const r = localStorage.getItem("rg_role");
    if (id) setStudentId(id);
    if (r) setRole(r);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Home Page</h1>

      {studentId ? <h3>Welcome, {studentId}</h3> : <h3>Welcome!</h3>}

      {role === "Student" && studentId && (
        <Link to={`/student/${studentId}/dashboard`}>
          <button style={{ padding: "8px 12px", marginTop: 10 }}>
            Student Dashboard
          </button>
        </Link>
      )}
    </div>
  );
}

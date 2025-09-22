// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";

export default function Home() {
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    // Retrieve stored userId from localStorage
    const id = localStorage.getItem("rg_userId");
    if (id) {
      setStudentId(id);
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {studentId ? (
        <h2>Hello! {studentId}</h2>
      ) : (
        <h2>Hello!</h2>
      )}
      <h1>Home Page</h1>
    </div>
  );
}

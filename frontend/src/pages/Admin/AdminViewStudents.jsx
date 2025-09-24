// frontend/src/pages/Admin/AdminViewStudents.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("rg_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

export default function AdminViewStudents() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [opMsg, setOpMsg] = useState("");
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");

  // Password reset UI state
  const [pwdFor, setPwdFor] = useState(null); // studentId currently being edited
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiFetch("/api/students"); // { students: [...] }
        setStudents(data.students || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [
        s.studentId,
        s.full_name,
        s.nic,
        s.phone,
        s.birthyear,
        s.gender,
        s.address,
        s.email,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, students]);

  // Change password via PUT /api/students/:id
  // Important: send ALL current fields + new password so we don't wipe anything.
  async function handleResetPassword(student) {
    try {
      setErr("");
      setOpMsg("");

      if (!pwd1 || !pwd2) throw new Error("Please enter and confirm the new password.");
      if (pwd1 !== pwd2) throw new Error("Passwords do not match.");
      if (pwd1.length < 6) throw new Error("Password must be at least 6 characters.");

      const payload = {
        full_name: student.full_name,
        nic: student.nic,
        phone: student.phone,
        birthyear: student.birthyear,
        gender: student.gender,
        address: student.address,
        email: student.email,
        password: pwd1, // only field we change
      };

      await apiFetch(`/api/students/${student.studentId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setOpMsg(`Password updated for ${student.studentId}.`);
      setPwdFor(null);
      setPwd1("");
      setPwd2("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleDelete(studentId) {
    const yes = window.confirm(
      `Are you sure you want to permanently delete student ${studentId}? This cannot be undone.`
    );
    if (!yes) return;

    try {
      setErr("");
      setOpMsg("");
      await apiFetch(`/api/students/${studentId}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
      setOpMsg(`Deleted student ${studentId}.`);
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Students</h1>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
        <p className="text-gray-600">View & manage student accounts</p>
      </div>

      {err && (
        <div className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2 border border-red-200">
          {err}
        </div>
      )}
      {opMsg && (
        <div className="mb-4 rounded-md bg-green-50 text-green-700 px-4 py-2 border border-green-200">
          {opMsg}
        </div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name, NIC, email…"
          className="w-full md:w-96 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => (
          <div
            key={s.studentId}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  s.profilePicUrl ||
                  "https://via.placeholder.com/96x96.png?text=No+Photo"
                }
                alt={`${s.full_name} profile`}
                className="w-16 h-16 rounded-lg object-cover border"
              />
              <div>
                <div className="text-sm text-gray-500">ID: {s.studentId}</div>
                <div className="font-semibold text-gray-900">{s.full_name}</div>
                <div className="text-xs text-gray-500">{s.email}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">NIC:</span> {s.nic}</div>
              <div><span className="font-medium">Phone:</span> {s.phone}</div>
              <div><span className="font-medium">Birth Year:</span> {s.birthyear}</div>
              <div><span className="font-medium">Gender:</span> {s.gender}</div>
              <div><span className="font-medium">Address:</span> {s.address}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setPwdFor((prev) => (prev === s.studentId ? null : s.studentId));
                  setPwd1("");
                  setPwd2("");
                  setOpMsg("");
                  setErr("");
                }}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                {pwdFor === s.studentId ? "Cancel" : "Change Password"}
              </button>

              <button
                onClick={() => handleDelete(s.studentId)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Delete Student
              </button>
            </div>

            {pwdFor === s.studentId && (
              <div className="mt-3 border-t pt-3">
                <label className="block text-sm text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter new password"
                />
                <label className="block text-sm text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Re-enter new password"
                />
                <button
                  onClick={() => handleResetPassword(s)}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-gray-500">No students match your search.</div>
      )}
    </div>
  );
}

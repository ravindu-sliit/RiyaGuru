// frontend/src/pages/Admin/AdminViewStudents.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Search } from "lucide-react";

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
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gray-50">
        {/* Orange Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-8 shadow-md">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Student Management</h1>
              <p className="text-orange-100">View and manage student accounts</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orange Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-8 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Student Management</h1>
              <p className="text-orange-100">View and manage student accounts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Messages */}
        {err && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 border border-red-200 shadow-sm">
            {err}
          </div>
        )}
        {opMsg && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3 border border-green-200 shadow-sm">
            {opMsg}
          </div>
        )}

        {/* Page Title and Search */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Students</h2>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, course, or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => (
          <div
            key={s.studentId}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/admin/students/${s.studentId}`)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setPwdFor((prev) => (prev === s.studentId ? null : s.studentId));
                  setPwd1("");
                  setPwd2("");
                  setOpMsg("");
                  setErr("");
                }}
                className="px-3 py-1.5 rounded-md bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors"
              >
                {pwdFor === s.studentId ? "Cancel" : "Change Password"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s.studentId);
                }}
                className="px-3 py-1.5 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
              >
                Delete Student
              </button>
            </div>

            {pwdFor === s.studentId && (
              <div className="mt-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                <label className="block text-sm text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetPassword(s);
                  }}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        ))}
        </div>

        {/* No Results Message */}
        {filtered.length === 0 && (
          <div className="mt-8 text-center text-gray-500 py-12">
            <p className="text-lg">No students match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

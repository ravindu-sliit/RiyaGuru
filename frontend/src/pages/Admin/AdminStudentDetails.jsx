// frontend/src/pages/Admin/AdminStudentDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, CreditCard, Edit, Trash2, Download } from "lucide-react";
import { exportStudentDetailsToPDF } from "../../utils/pdfExportSimple";

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

export default function AdminStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [opMsg, setOpMsg] = useState("");
  const [student, setStudent] = useState(null);

  // Password reset UI state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiFetch(`/api/students/${id}`);
        setStudent(data.student);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleResetPassword() {
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
        password: pwd1,
      };

      await apiFetch(`/api/students/${student.studentId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setOpMsg(`Password updated successfully.`);
      setShowPwdModal(false);
      setPwd1("");
      setPwd2("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleDelete() {
    const yes = window.confirm(
      `Are you sure you want to permanently delete student ${student.studentId}? This cannot be undone.`
    );
    if (!yes) return;

    try {
      setErr("");
      setOpMsg("");
      await apiFetch(`/api/students/${student.studentId}`, { method: "DELETE" });
      setOpMsg(`Deleted student ${student.studentId}.`);
      setTimeout(() => navigate("/admin/students"), 1500);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleExportPDF() {
    try {
      setOpMsg("Generating PDF...");
      await exportStudentDetailsToPDF(student);
      setOpMsg("PDF exported successfully!");
      setTimeout(() => setOpMsg(""), 3000);
    } catch (e) {
      setErr("Failed to export PDF: " + e.message);
      setTimeout(() => setErr(""), 5000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading student details…</p>
        </div>
      </div>
    );
  }

  if (err && !student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2 border border-red-200">
            {err}
          </div>
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Students
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Student Details</h1>
          <p className="text-gray-600">View and manage student information</p>
        </div>

        {/* Messages */}
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

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <div className="flex items-center gap-6">
              <img
                src={
                  student.profilePicUrl ||
                  "https://via.placeholder.com/128x128.png?text=No+Photo"
                }
                alt={`${student.full_name} profile`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{student.full_name}</h2>
                <div className="flex items-center gap-2 text-blue-100">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-lg">ID: {student.studentId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Email</div>
                  <div className="text-gray-900">{student.email || "Not provided"}</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-green-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Phone</div>
                  <div className="text-gray-900">{student.phone || "Not provided"}</div>
                </div>
              </div>

              {/* NIC */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">NIC</div>
                  <div className="text-gray-900">{student.nic || "Not provided"}</div>
                </div>
              </div>

              {/* Birth Year */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Birth Year</div>
                  <div className="text-gray-900">{student.birthyear || "Not provided"}</div>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-pink-50 rounded-lg">
                  <User className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Gender</div>
                  <div className="text-gray-900">{student.gender || "Not provided"}</div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-yellow-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Address</div>
                  <div className="text-gray-900">{student.address || "Not provided"}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Details
              </button>

              <button
                onClick={() => setShowPwdModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Change Password
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Save Password
              </button>
              <button
                onClick={() => {
                  setShowPwdModal(false);
                  setPwd1("");
                  setPwd2("");
                  setErr("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

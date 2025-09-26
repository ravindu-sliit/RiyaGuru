// src/pages/Instructor/InstructorListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const headers = [
  { key: "instructorId", label: "ID", icon: "" },
  { key: "name", label: "Name", icon: "" },
  { key: "email", label: "Email", icon: "" },
  { key: "phone", label: "Phone", icon: "" },
  { key: "specialization", label: "Specialization", icon: "" },
  { key: "status", label: "Status", icon: "" },
  { key: "actions", label: "Actions", icon: "" },
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (q) {
      const k = q.toLowerCase();
      list = list.filter((r) =>
        [r.instructorId, r.name, r.email, r.phone, r.specialization]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(k))
      );
    }
    if (spec !== "All") list = list.filter((r) => r.specialization === spec);
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, q, spec, sortKey, asc]);

  // const exportCSV = () => {
  //   const header = ["ID,Name,Email,Phone,Specialization,Status"];
  //   const body = filtered.map((r) =>
  //     [r.instructorId, r.name, r.email, r.phone, r.specialization, r.status]
  //       .map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`)
  //       .join(",")
  //   );
  //   const blob = new Blob([header.concat(body).join("\n")], {
  //     type: "text/csv;charset=utf-8",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "instructors.csv";
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

 const exportPDF = () => {
  const doc = new jsPDF();

  const headers = [["ID", "Name", "Email", "Phone", "Specialization", "Status"]];
  const body = filtered.map((r) => [
    r.instructorId,
    r.name,
    r.email,
    r.phone,
    r.specialization,
    r.status,
  ]);

  doc.setFontSize(16);
  doc.text("Instructor List", 14, 15);

  // ✅ correct way to use autoTable
  autoTable(doc, {
    head: headers,
    body: body,
    startY: 25,
  });

  doc.save("instructors.pdf");
};


  const toggleStatus = async (rec) => {
    const next = rec.status === "Active" ? "Not-Active" : "Active";
    await InstructorAPI.toggleStatus(rec._id || rec.id, next);
    fetchRows();
  };

  const remove = async (rec) => {
    if (!window.confirm(`Delete ${rec.name}? This also deletes linked User.`))
      return;
    await InstructorAPI.remove(rec._id || rec.id);
    fetchRows();
  };

  const onSort = (key) => {
    if (key === "actions") return;
    if (sortKey === key) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const getSpecializationIcon = (spec) => {
    const icons = {
      Car: "",
      Motorcycle: "",
      Threewheeler: "",
      HeavyVehicle: "",
      All: "",
    };
    return icons[spec] || "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
            Vehicles Management
          </Link>
          <Link
            to="/Instructordashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium"
          >
             Instructors Management
          </Link>
          <Link
            to="/students"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
             Students
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              All Instructors
            </h1>
            <p className="text-slate-600 text-lg">
              Manage instructor profiles and monitor their status
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/instructors/add"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
            >
              <span className="text-lg">+</span>
              Add Instructor
            </Link>
            <button
              onClick={exportPDF }
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 px-6 py-3 rounded-lg font-medium border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone, or ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:outline-none transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-lg"></span>
              </div>
              <select
                className="pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:outline-none transition-all appearance-none cursor-pointer min-w-[200px]"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
              >
                <option value="All">All Specializations</option>
                <option value="Car">Car</option>
                <option value="Motorcycle"> Motorcycle</option>
                <option value="Threewheeler"> Threewheeler</option>
                <option value="HeavyVehicle"> Heavy Vehicle</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400">▼</span>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Showing {filtered.length} of {rows.length} instructors
            </span>
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Row */}
            <div className="bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-12 gap-4 p-6 text-sm font-medium text-slate-700">
                {headers.map((h) => (
                  <div
                    key={h.key}
                    onClick={() => onSort(h.key)}
                    className={`flex items-center gap-2 ${
                      h.key === "actions"
                        ? "col-span-3 cursor-default"
                        : "col-span-1 cursor-pointer hover:text-orange-600 transition-colors"
                    } ${h.key === "name" || h.key === "email" ? "col-span-2" : ""}`}
                  >
                    <span>{h.icon}</span>
                    <span>{h.label}</span>
                    {sortKey === h.key && h.key !== "actions" && (
                      <span className="text-orange-600">{asc ? "▲" : "▼"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <div
                  key={r._id || r.id}
                  className="grid grid-cols-12 gap-4 p-6 hover:bg-slate-50 transition-colors"
                >
                  {/* ID */}
                  <div className="col-span-1 flex items-center">
                    <span className="font-mono text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {r.instructorId}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {r.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{r.name}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-2 flex items-center text-sm text-slate-600 truncate">
                    {r.email}
                  </div>

                  {/* Phone */}
                  <div className="col-span-1 flex items-center text-sm text-slate-600">
                    {r.phone}
                  </div>

                  {/* Specialization */}
                  <div className="col-span-1 flex items-center gap-2">
                    <span className="text-lg">
                      {getSpecializationIcon(r.specialization)}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {r.specialization}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        r.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {r.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center gap-2">
                    <button
                      onClick={() => nav(`/instructors/${r._id || r.id}`)}
                      className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => nav(`/instructors/${r._id || r.id}/edit`)}
                      className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(r)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg ${
                        r.status === "Active"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {r.status === "Active" ? " Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="px-3 py-2 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                    >
                       Delete
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-16 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    No instructors found
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {q
                      ? "Try adjusting your search terms"
                      : "No instructors match the selected criteria"}
                  </p>
                  {q && (
                    <button
                      onClick={() => setQ("")}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-orange-500 text-lg"></span>
              <h3 className="text-lg font-semibold text-slate-800">
                Quick Stats
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {rows.length}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Total Instructors
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {rows.filter((r) => r.status === "Active").length}
                </div>
                <div className="text-sm text-slate-600 font-medium">Active</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {rows.filter((r) => r.status !== "Active").length}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Inactive
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {filtered.length}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Filtered Results
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

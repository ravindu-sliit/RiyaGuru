import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { Users, Search } from "lucide-react";
import { toast } from "react-toastify";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await studentService.getAllStudents();
        setStudents(data.students || []);
      } catch (err) {
        toast.error("Failed to fetch students");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading students…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Users className="w-6 h-6 text-blue-600" />
          Students
        </h1>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow border">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      {/* Student list */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link
              key={s.studentId}
              to={`/lesson-progress/student/${s.studentId}`}
              className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {s.full_name}
              </h2>
              <p className="text-sm text-gray-600">ID: {s.studentId}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No students found.</p>
      )}
    </div>
  );
}

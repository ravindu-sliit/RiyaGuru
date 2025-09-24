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
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
        <p className="ml-3">Loading students…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <Users className="w-7 h-7 text-blue-600" />
          Student Directory
        </h1>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Student list */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <Link
              key={s.studentId}
              to={`/instructor/lesson-progress/student/${s.studentId}`}
              className="group bg-white rounded-xl shadow border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
            >
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                {s.full_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">ID: {s.studentId}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          No students found.
        </div>
      )}
    </div>
  );
}

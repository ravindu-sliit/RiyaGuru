import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { Users, Search, X, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

// A small utility: debounce hook
function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [visibleLimit, setVisibleLimit] = useState(12);
  const debouncedSearch = useDebounced(searchTerm, 300);

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

  // filter by debounced term for better UX
  const filtered = students
    .filter((s) => {
      const term = String(debouncedSearch || "").trim().toLowerCase();
      if (!term) return true;
      return (
        String(s.full_name || "").toLowerCase().includes(term) ||
        String(s.studentId || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "az") return a.full_name.localeCompare(b.full_name);
      return b.full_name.localeCompare(a.full_name);
    });

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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-2 md:mb-0">
            <Users className="w-7 h-7 text-blue-600" />
            Student Directory
          </h1>
          <div className="text-sm text-gray-500">{filtered.length} students</div>
        </div>

        {/* Search + controls */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow border w-full md:w-auto">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 md:w-80 outline-none text-sm text-gray-700"
          />
          {searchTerm && (
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <div className="ml-2 flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm text-gray-600 bg-white border rounded px-2 py-1"
            >
              <option value="az">Sort: A → Z</option>
              <option value="za">Sort: Z → A</option>
            </select>
            <button
              className="ml-2 text-sm text-blue-600 flex items-center gap-1"
              onClick={() => {
                setVisibleLimit((v) => v + 12);
              }}
            >
              Show more <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student list */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, visibleLimit).map((s) => (
            <Link
              key={s.studentId}
              to={`/instructor/lesson-progress/student/${s.studentId}`}
              className="group bg-white rounded-xl shadow border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                  {s.full_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">ID: {s.studentId}</p>
                {s.phone && <p className="text-sm text-gray-500 mt-1">{s.phone}</p>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">{s.enrolledCourses?.length || 0} courses</span>
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={(e) => {
                      // prevent Link navigation so we can go to lesson entry with preselected student
                      e.preventDefault();
                      window.location.href = `/instructor/lesson-entry?studentId=${encodeURIComponent(s.studentId)}`;
                    }}
                  >
                    Add Lesson
                  </button>
                  <Link
                    to={`/instructor/lesson-progress/student/${s.studentId}`}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          No students found.
        </div>
      )}

      {filtered.length > visibleLimit && (
        <div className="mt-6 text-center">
          <button
            className="px-4 py-2 bg-white border rounded shadow text-sm"
            onClick={() => setVisibleLimit((v) => v + 12)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import {
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Calendar,
  Settings,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import LessonProgressCard from "../../components/LessonProgressCard";

export default function LessonProgressDashboard() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      const data = await lessonProgressService.getAllLessonProgress();
      setLessons(data);

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        total: data.length,
        completed: data.filter((l) => l.status === "Completed").length,
        pending: data.filter((l) => l.status === "Pending").length,
        thisWeek: data.filter((l) => new Date(l.date) >= oneWeekAgo).length,
      });
    } catch (error) {
      toast.error("Failed to fetch lesson progress");
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  }

  const recentLessons = lessons
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav Header */}
      <div className="bg-white shadow flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <BookOpen className="w-5 h-5" />
          <span>DriveSchool - Lesson Progress</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            to="/lesson-progress"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <Settings size={16} />
            Dashboard
          </Link>
          <Link
            to="/lesson-progress/add"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <Plus size={16} />
            Add Lesson
          </Link>
          <Link
            to="/progress-tracking"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <TrendingUp size={16} />
            Progress Tracking
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="px-6 py-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Lesson Progress Management
          </h1>
          <p className="text-gray-600 text-sm">
            Track and manage student lesson progress
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            <Filter size={16} />
            Filter
          </button>
          <Link
            to="/lesson-progress/add"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Lesson Progress
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
        <StatCard
          title="Total Lessons"
          value={stats.total}
          subtitle="All recorded lessons"
          icon={<BookOpen size={20} />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Completed Lessons"
          value={stats.completed}
          subtitle="Successfully completed"
          icon={<CheckCircle size={20} />}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pending Lessons"
          value={stats.pending}
          subtitle="Awaiting completion"
          icon={<Clock size={20} />}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="This Week"
          value={stats.thisWeek}
          subtitle="Lessons this week"
          icon={<Calendar size={20} />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Recent Lessons */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={20} />
              Recent Lesson Progress
            </h2>
            <Link
              to="/lesson-progress/all"
              className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
            >
              View All Lessons
            </Link>
          </div>

          {recentLessons.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {recentLessons.map((lesson) => (
                <LessonProgressCard key={lesson._id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BookOpen className="mx-auto mb-4" size={40} />
              <p>No lesson progress recorded yet</p>
              <Link
                to="/lesson-progress/add"
                className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add First Lesson
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <QuickAction to="/lesson-progress/add" icon={<Plus size={20} />}>
              Add New Lesson
            </QuickAction>
            <QuickAction to="/lesson-progress/students" icon={<Users size={20} />}>
              View by Student
            </QuickAction>
            <QuickAction to="/progress-tracking" icon={<TrendingUp size={20} />}>
              Progress Tracking
            </QuickAction>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */
function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function QuickAction({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
    >
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
        {icon}
      </div>
      <span className="font-medium">{children}</span>
    </Link>
  );
}

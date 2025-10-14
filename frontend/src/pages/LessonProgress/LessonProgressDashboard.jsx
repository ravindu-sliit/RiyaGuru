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

import InstructorNav from "../../components/InstructorNav";
import ProgressHero from "../../components/ProgressHero";
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="h-12 w-12 bg-orange-100 rounded-full opacity-75"></div>
          </div>
        </div>
        <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorNav />
      <ProgressHero title="Lesson Progress Management" subtitle="Track and manage student lesson progress with comprehensive analytics and insights">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300">
            <Filter size={18} />
            Filter
          </button>
          {localStorage.getItem("rg_role") === "Instructor" && (
            <Link to="/instructor/lesson-entry" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5">
              <Plus size={18} />
              Add Lesson Progress
            </Link>
          )}
        </div>
      </ProgressHero>

      {/* Stats Dashboard */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Lessons"
            value={stats.total}
            subtitle="All recorded lessons"
            icon={<BookOpen size={24} />}
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            change="+12% this month"
            positive={true}
          />
          <StatCard
            title="Completed Lessons"
            value={stats.completed}
            subtitle="Successfully completed"
            icon={<CheckCircle size={24} />}
            gradient="from-green-500 to-emerald-600"
            bgColor="bg-green-50"
            textColor="text-green-600"
            change="+8% this week"
            positive={true}
          />
          <StatCard
            title="Pending Lessons"
            value={stats.pending}
            subtitle="Awaiting completion"
            icon={<Clock size={24} />}
            gradient="from-yellow-500 to-orange-500"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
            change="-3% this week"
            positive={false}
          />
          <StatCard
            title="This Week"
            value={stats.thisWeek}
            subtitle="Lessons this week"
            icon={<Calendar size={24} />}
            gradient="from-purple-500 to-indigo-600"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
            change="+15% vs last week"
            positive={true}
          />
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                Recent Lesson Progress
              </h2>
              <Link
                to="/instructor/lesson-progress/all"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-gray-700"
              >
                View All Lessons
              </Link>
            </div>
          </div>

          <div className="p-8">
            {recentLessons.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {recentLessons.map((lesson) => (
                  <LessonProgressCard key={lesson._id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-12 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            <p className="text-gray-600 mt-1">Commonly used features and shortcuts</p>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-6">
            {localStorage.getItem("rg_role") === "Instructor" && (
              <QuickAction to="/instructor/lesson-entry" icon={<Plus size={20} />} gradient="from-orange-500 to-red-500">
                Add New Lesson
              </QuickAction>
            )}
            <QuickAction to="/instructor/lesson-progress/students" icon={<Users size={20} />} gradient="from-blue-500 to-cyan-500">
              View by Student
            </QuickAction>
            <QuickAction to="/instructor/progress-tracking" icon={<TrendingUp size={20} />} gradient="from-purple-500 to-indigo-500">
              Progress Tracking
            </QuickAction>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Styled Subcomponents --- */
function NavItem({ to, icon, children, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
        active
          ? "bg-orange-50 text-orange-600 border border-orange-200"
          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function StatCard({ title, value, subtitle, icon, gradient, bgColor, textColor, change, positive }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`${textColor}`}>{icon}</div>
        </div>
        <div
          className={`text-sm font-semibold px-2 py-1 rounded-lg ${
            positive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
          }`}
        >
          {change}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function QuickAction({ to, icon, children, gradient }) {
  return (
    <Link
      to={to}
      className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-1 transition-all text-left"
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">{children}</h3>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <BookOpen className="text-gray-500" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No lesson progress recorded yet</h3>
      <p className="text-gray-600 mb-6">Start tracking lessons by adding a new entry</p>
      <Link
        to="/instructor/lesson-entry"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Plus size={18} />
        Add First Lesson
      </Link>
    </div>
  );
}

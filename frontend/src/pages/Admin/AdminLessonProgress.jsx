import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import ProgressHero from "../../components/ProgressHero";
import { toast } from "react-toastify";
import LessonProgressCard from "../../components/LessonProgressCard";

export default function AdminLessonProgress() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, thisWeek: 0 });

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      const data = await lessonProgressService.getAllLessonProgress();
      setLessons(data || []);
      const total = (data || []).length;
      const completed = (data || []).filter((l) => l.status === "completed").length;
      const pending = total - completed;
      // simple thisWeek calculation: lessons with date within last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = (data || []).filter((l) => new Date(l.date) >= oneWeekAgo).length;
      setStats({ total, completed, pending, thisWeek });
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  const recentLessons = lessons.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <ProgressHero title="Lesson Progress (Admin)" subtitle="View and manage lesson progress for all students" ctaTo="/admin/instructor/lesson-entry" ctaText="Add Lesson (Admin)" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Lessons" value={stats.total} icon={<BookOpen size={20} />} />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircle size={20} />} />
          <StatCard title="Pending" value={stats.pending} icon={<Clock size={20} />} />
          <StatCard title="This Week" value={stats.thisWeek} icon={<Calendar size={20} />} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Lesson Progress</h2>
            <Link to="/admin/instructor/lesson-progress/all" className="text-sm text-gray-600">View All</Link>
          </div>
          {recentLessons.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {recentLessons.map((lesson) => (
                <LessonProgressCard key={lesson._id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">No recent lessons found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="mt-3 text-gray-400">{icon}</div>
    </div>
  );
}

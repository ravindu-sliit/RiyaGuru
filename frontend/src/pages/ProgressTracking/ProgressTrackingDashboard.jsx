// src/pages/ProgressTracking/ProgressTrackingDashboard.jsx
import React, { useState, useEffect } from "react";
import { progressTrackingService } from "../../services/progressTrackingService";
import {
  TrendingUp,
  Users,
  Award,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import ProgressChart from "../../components/ProgressChart";

export default function ProgressTrackingDashboard() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleForCertificate: 0,
    certificatesIssued: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    fetchProgressRecords();
  }, []);

  const fetchProgressRecords = async () => {
    try {
      setLoading(true);
      const data = await progressTrackingService.getAllProgress();
      setProgressRecords(data);

      const statsData = {
        totalStudents: data.length,
        eligibleForCertificate: data.filter(
          (p) => p.certificate_status === "Eligible"
        ).length,
        certificatesIssued: data.filter(
          (p) => p.certificate_status === "Issued"
        ).length,
        averageProgress:
          data.length > 0
            ? Math.round(
                data.reduce((sum, p) => sum + p.progress_percent, 0) /
                  data.length
              )
            : 0,
      };
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to fetch progress records");
      console.error("Error fetching progress records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (studentId, courseName) => {
    try {
      await progressTrackingService.manualUpdateProgress(studentId, courseName);
      toast.success("Progress updated successfully");
      fetchProgressRecords();
    } catch (error) {
      toast.error(error.message || "Failed to update progress");
    }
  };

  const handleIssueCertificate = async (studentId, courseName) => {
    try {
      await progressTrackingService.issueCertificate(studentId, courseName);
      toast.success("Certificate issued successfully");
      fetchProgressRecords();
    } catch (error) {
      toast.error(error.message || "Failed to issue certificate");
    }
  };

  const filteredRecords = progressRecords.filter((record) => {
    const studentId = record.student_id || "";
    const courseName = record.course_name || "";
    return (
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
        <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full mb-4"></div>
        <p className="font-medium">Loading progress tracking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progress Tracking Dashboard</h1>
            <p className="text-blue-200 text-sm">
              Monitor course completion, track progress, and issue certificates
            </p>
          </div>
          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg text-sm border border-gray-300 w-64 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
              />
            </div>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users size={22} />}
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Eligible for Certificate"
            value={stats.eligibleForCertificate}
            icon={<Award size={22} />}
            gradient="from-green-500 to-emerald-600"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            title="Certificates Issued"
            value={stats.certificatesIssued}
            icon={<Award size={22} />}
            gradient="from-yellow-500 to-orange-500"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <StatCard
            title="Average Progress"
            value={`${stats.averageProgress}%`}
            icon={<TrendingUp size={22} />}
            gradient="from-purple-500 to-indigo-600"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
      </div>

      {/* Progress Records */}
      <div className="px-6 py-10 max-w-7xl mx-auto">
        {filteredRecords.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredRecords.map((record) => (
              <ProgressChart
                key={`${record.student_id}-${record.course_name}`}
                progress={record}
                onUpdateProgress={() =>
                  handleUpdateProgress(record.student_id, record.course_name)
                }
                onIssueCertificate={() =>
                  handleIssueCertificate(record.student_id, record.course_name)
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-500 shadow border border-gray-100">
            <TrendingUp size={40} className="mx-auto mb-3 text-gray-400" />
            {searchTerm
              ? "No progress records match your search"
              : "No progress records found"}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Certificate Banner */}
      {stats.eligibleForCertificate > 0 && (
        <div className="px-6 pb-10 max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 flex justify-between items-center shadow">
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                Certificate Action Required
              </h3>
              <p className="text-xs text-yellow-700">
                {stats.eligibleForCertificate} student(s) are eligible for
                certificates
              </p>
            </div>
            <Award size={24} className="text-yellow-600" />
          </div>
        </div>
      )}
    </div>
  );
}

/* Styled StatCard */
function StatCard({ title, value, icon, gradient, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`${textColor}`}>{icon}</div>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase">
        {title}
      </h3>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

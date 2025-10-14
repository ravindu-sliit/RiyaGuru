import React, { useState, useEffect } from "react";
import { progressTrackingService } from "../../services/progressTrackingService";
import { toast } from "react-toastify";
import { TrendingUp, Users, Award, Search, Filter } from "lucide-react";
import ProgressChart from "../../components/ProgressChart";
import ProgressHero from "../../components/ProgressHero";

export default function AdminProgressTracking() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalStudents: 0, eligibleForCertificate: 0, certificatesIssued: 0, averageProgress: 0 });

  useEffect(() => {
    fetchProgressRecords();
  }, []);

  const fetchProgressRecords = async () => {
    try {
      setLoading(true);
      const data = await progressTrackingService.getAllProgress();
      setProgressRecords(data || []);
      const statsData = {
        totalStudents: data.length,
        eligibleForCertificate: data.filter((p) => p.certificate_status === "Eligible").length,
        certificatesIssued: data.filter((p) => p.certificate_status === "Issued").length,
        averageProgress: data.length > 0 ? Math.round(data.reduce((sum, p) => sum + p.progress_percent, 0) / data.length) : 0,
      };
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to fetch progress records");
      console.error(error);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <ProgressHero title="Progress Tracking (Admin)" subtitle="Monitor course completion, track progress, and issue certificates">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search students or courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 rounded-lg text-sm border border-gray-300 w-64" />
            </div>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-sm"> <Filter size={16} /> Filter</button>
          </div>
        </ProgressHero>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<Users size={20} />} />
          <StatCard title="Eligible" value={stats.eligibleForCertificate} icon={<Award size={20} />} />
          <StatCard title="Issued" value={stats.certificatesIssued} icon={<Award size={20} />} />
          <StatCard title="Avg Progress" value={`${stats.averageProgress}%`} icon={<TrendingUp size={20} />} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          {filteredRecords.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredRecords.map((record) => (
                <ProgressChart
                  key={`${record.student_id}-${record.course_name}`}
                  progress={record}
                  onUpdateProgress={() => handleUpdateProgress(record.student_id, record.course_name)}
                  onIssueCertificate={() => handleIssueCertificate(record.student_id, record.course_name)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">No progress records found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="mt-3 text-gray-400">{icon}</div>
    </div>
  );
}

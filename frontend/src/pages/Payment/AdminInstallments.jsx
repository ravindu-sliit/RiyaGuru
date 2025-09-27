import React, { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { getAllPlans, adminApprovePlan, adminRejectPlan } from "../../api/installmentApi";
import AdminLayout from "../../layouts/AdminLayout";

const AdminInstallments = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch all plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPlans(); // Admin: no studentId → gets all
      setPlans(Array.isArray(data["plans"]) ? data["plans"] : []);
    } catch (err) {
      console.error("Failed to fetch installment plans:", err);
      setError("Failed to load installment plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openReview = (plan) => {
    setSelectedPlan(plan);
    setReviewComment("");
    setReviewOpen(true);
  };
  const closeReview = () => {
    setReviewOpen(false);
    setSelectedPlan(null);
    setReviewComment("");
  };
  const approveFromModal = async () => {
    if (!selectedPlan) return;
    try {
      setSavingId(selectedPlan._id);
      await adminApprovePlan(selectedPlan._id, reviewComment);
      closeReview();
      await fetchPlans();
      setSuccessMessage("Installment plan approved.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to approve: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };
  const rejectFromModal = async () => {
    if (!selectedPlan) return;
    try {
      setSavingId(selectedPlan._id);
      await adminRejectPlan(selectedPlan._id, reviewComment);
      closeReview();
      await fetchPlans();
      setSuccessMessage("Installment plan rejected.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to reject: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  // Get unique courses and statuses
  const uniqueCourses = [...new Set(plans.map((p) => p.courseId))].filter(
    Boolean
  );
  const uniqueStatuses = [
    ...new Set(plans.flatMap((p) => p.schedule.map((s) => s.status))),
  ];

  // Filter logic
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      searchTerm === "" ||
      plan.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.courseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "" || plan.courseId === filterCourse;
    const matchesStatus =
      filterStatus === "" ||
      plan.schedule.some((item) => item.status === filterStatus);
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Format helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Approved":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Approved
          </span>
        );
      case "Overdue":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            <XCircle className="w-3 h-3 inline mr-1" />
            Overdue
          </span>
        );
      case "Pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            <Clock className="w-3 h-3 inline mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>
        );
    }
  };

  // Overall plan status
  const getPlanStatus = (schedule) => {
    const approved = schedule.filter((s) => s.status === "Approved").length;
    const overdue = schedule.filter((s) => s.status === "Overdue").length;
    if (approved === schedule.length) return "Completed";
    if (overdue > 0) return "Overdue";
    return "Active";
  };

  const getPlanStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Completed":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            Completed
          </span>
        );
      case "Overdue":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>Overdue</span>
        );
      case "Active":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>Active</span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading installment plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPlans}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Installment Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Review student installment plans and approve or reject with a comment. After approval, students can pay the down payment first.
          </p>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student, course, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Course Filter */}
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {uniqueCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* No Results */}
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Installment Plans Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterCourse || filterStatus
                ? "Try adjusting your filters."
                : "No installment plans in the system yet."}
            </p>
          </div>
        ) : (
          /* Plans Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Down Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlans.map((plan) => (
                    <React.Fragment key={plan._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {plan.studentId}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {plan._id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{plan.courseId}</div>
                          <div className="text-xs text-gray-500">
                            {plan.totalInstallments} installments
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(plan.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(plan.downPayment)}
                        </td>
                        <td className="px-6 py-4">
                          {getPlanStatusBadge(getPlanStatus(plan.schedule))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(plan.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {plan.adminApproved ? (
                              <span className="text-green-600 text-sm">Approved</span>
                            ) : (
                              <button
                                onClick={() => openReview(plan)}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Schedule Details (Collapsible later if needed) */}
                      <tr>
                        <td colSpan="7" className="px-6 py-2 bg-gray-50">
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Installment Schedule
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {plan.schedule.map((item) => (
                                <div
                                  key={item.installmentNumber}
                                  className="bg-white p-3 rounded border text-center text-xs"
                                >
                                  <div className="font-medium">
                                    #{item.installmentNumber}
                                  </div>
                                  <div className="text-gray-700">
                                    {formatCurrency(item.amount)}
                                  </div>
                                  <div className="text-gray-500 mt-1">
                                    {formatDate(item.dueDate)}
                                  </div>
                                  <div className="mt-2">
                                    {getStatusBadge(item.status)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">
              {plans.length}
            </div>
            <div className="text-gray-600">Total Plans</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {
                plans.filter((p) => getPlanStatus(p.schedule) === "Completed")
                  .length
              }
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-red-600">
              {
                plans.filter((p) => getPlanStatus(p.schedule) === "Overdue")
                  .length
              }
            </div>
            <div className="text-gray-600">Overdue</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">
              {
                plans.filter((p) => getPlanStatus(p.schedule) === "Active")
                  .length
              }
            </div>
            <div className="text-gray-600">Active</div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && (
        <ReviewInstallmentModal
          plan={selectedPlan}
          onClose={closeReview}
          onApprove={approveFromModal}
          onReject={rejectFromModal}
          comment={reviewComment}
          setComment={setReviewComment}
          saving={savingId === selectedPlan?._id}
        />
      )}
    </AdminLayout>
  );
};

// Review Modal for Installments
const ReviewInstallmentModal = ({ plan, onClose, onApprove, onReject, comment, setComment, saving }) => {
  if (!plan) return null;
  const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review Installment Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Student</div>
            <div className="text-gray-900 font-medium">{plan.studentId}</div>
            <div className="text-sm text-gray-500">Plan ID: {plan._id.slice(-8)}</div>

            <div className="text-sm text-gray-600 mt-4 mb-1">Course</div>
            <div className="text-gray-900 font-medium">{plan.courseId}</div>

            <div className="text-sm text-gray-600 mt-4 mb-1">Totals</div>
            <div className="text-gray-900 font-medium">{formatCurrency(plan.totalAmount)}</div>
            <div className="text-sm text-gray-500">Down Payment: {formatCurrency(plan.downPayment)}</div>
            <div className="text-sm text-gray-500">Installments: {plan.totalInstallments}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Schedule</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {plan.schedule.map((s) => (
                <div key={s.installmentNumber} className="border rounded p-2">
                  <div className="font-medium">#{s.installmentNumber}</div>
                  <div>{formatCurrency(s.amount)}</div>
                  <div className="text-gray-500">{formatDate(s.dueDate)}</div>
                  <div className="mt-1">
                    {s.status === "Approved" ? (
                      <span className="text-green-700">Approved</span>
                    ) : s.status === "Overdue" ? (
                      <span className="text-red-700">Overdue</span>
                    ) : (
                      <span className="text-yellow-700">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <label className="block text-sm text-gray-600 mb-1">Admin Comment (optional or reason for rejection)</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
            placeholder="Type a note or rejection reason..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-lg">Close</button>
            <button onClick={onReject} disabled={saving} className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg">Reject</button>
            <button onClick={onApprove} disabled={saving} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg">Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInstallments;

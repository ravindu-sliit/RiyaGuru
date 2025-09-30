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

  // Accent classes by plan status for the entire card
  const cardAccent = (status) => {
    if (status === "Completed") return "border-l-4 border-green-400/80 bg-gradient-to-br from-green-50/60 to-white";
    if (status === "Overdue") return "border-l-4 border-red-400/80 bg-gradient-to-br from-red-50/60 to-white";
    if (status === "Active") return "border-l-4 border-blue-400/80 bg-gradient-to-br from-blue-50/40 to-white";
    return "border-l-4 border-slate-200";
  };

  // Quick approve/reject from card
  const approveQuick = async (planId) => {
    try {
      setSavingId(planId);
      await adminApprovePlan(planId, "");
      await fetchPlans();
      setSuccessMessage("Installment plan approved.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to approve: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  const rejectQuick = async (planId) => {
    try {
      setSavingId(planId);
      await adminRejectPlan(planId, "");
      await fetchPlans();
      setSuccessMessage("Installment plan rejected.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to reject: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
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

  // Get unique courses
  const uniqueCourses = [...new Set(plans.map((p) => p.courseId))].filter(Boolean);
  // Plan-level admin status options for filter
  const statusOptions = ["Approved", "Pending", "Rejected"];

  const norm = (v) => String(v || "").trim().toLowerCase();

  // Determine admin plan status (robust across possible backend fields)
  function getAdminPlanStatus(plan) {
    const s = (plan?.adminStatus || plan?.status || "").toString().toLowerCase();
    if (plan?.adminApproved === true) return "Approved";
    if (
      s === "rejected" ||
      plan?.adminRejected === true ||
      plan?.adminDecision === "Rejected"
    ) {
      return "Rejected";
    }
    return "Pending"; // default
  }

  // Filter logic (search + course + admin plan status)
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      searchTerm === "" ||
      plan.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.courseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "" || plan.courseId === filterCourse;
    const matchesStatus = filterStatus === "" || norm(getAdminPlanStatus(plan)) === norm(filterStatus);
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
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ring-1";
    if (status === "Approved") return (
      <span className={`${base} bg-green-50 text-green-700 ring-green-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Approved
      </span>
    );
    if (status === "Overdue") return (
      <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Overdue
      </span>
    );
    if (status === "Pending") return (
      <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
      </span>
    );
    return (
      <span className={`${base} bg-gray-50 text-gray-700 ring-gray-200`}>{status}</span>
    );
  };

  // Overall plan status (hoisted declaration for earlier use)
  function getPlanStatus(schedule) {
    const approved = schedule.filter((s) => s.status === "Approved").length;
    const overdue = schedule.filter((s) => s.status === "Overdue").length;
    if (approved === schedule.length) return "Completed";
    if (overdue > 0) return "Overdue";
    return "Active";
  }

  const getPlanStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold ring-1 inline-flex items-center gap-2";
    if (status === "Completed") return (
      <span className={`${base} bg-green-50 text-green-700 ring-green-200`}>
        <CheckCircle className="w-3 h-3" /> Completed
      </span>
    );
    if (status === "Overdue") return (
      <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>
        <XCircle className="w-3 h-3" /> Overdue
      </span>
    );
    if (status === "Active") return (
      <span className={`${base} bg-blue-50 text-blue-700 ring-blue-200`}>Active</span>
    );
    return (
      <span className={`${base} bg-gray-50 text-gray-700 ring-gray-200`}>{status}</span>
    );
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
      <div className="px-6 py-6">
        {/* Page Content */}

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
              {statusOptions.map((status) => (
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
          /* Plans as Cards */
          <div className="grid grid-cols-1 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className={`relative group rounded-2xl border shadow-sm hover:shadow-lg transition-all ${cardAccent(getPlanStatus(plan.schedule))}`}
              >
                {/* Ribbon */}
                <div className="pointer-events-none absolute -top-2 left-4 h-2 w-24 rounded-full bg-gradient-to-r from-orange-400 to-amber-300 opacity-70"></div>
                {plan.adminApproved === true && (
                  <div className="pointer-events-none absolute -top-2 right-4 h-2 w-24 rounded-full bg-gradient-to-l from-green-400 to-emerald-300 opacity-70"></div>
                )}
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Student</div>
                    <div className="text-base font-semibold text-gray-900">{plan.studentId}</div>
                    <div className="text-xs text-gray-400">ID: {plan._id.slice(-6)}</div>
                  </div>
                  {getPlanStatusBadge(getPlanStatus(plan.schedule))}
                </div>

                {/* Body meta */}
                <div className="px-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/70 backdrop-blur-[1px] p-3 ring-1 ring-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Course</div>
                    <div className="font-medium text-gray-800">{plan.courseId}</div>
                    <div className="text-xs text-gray-500">{plan.totalInstallments} installments</div>
                  </div>
                  <div className="rounded-lg bg-white/70 backdrop-blur-[1px] p-3 ring-1 ring-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Totals</div>
                    <div className="font-medium text-gray-800">{formatCurrency(plan.totalAmount)}</div>
                    <div className="text-xs text-gray-500">Down: {formatCurrency(plan.downPayment)}</div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="px-5 mt-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Installment Schedule</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {plan.schedule.map((item) => (
                      <div key={item.installmentNumber} className="rounded-lg bg-white/80 ring-1 ring-gray-200 p-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">#{item.installmentNumber}</div>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="mt-1 text-gray-700">{formatCurrency(item.amount)}</div>
                        <div className="text-gray-500">{formatDate(item.dueDate)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-5 py-4 flex items-center justify-between border-t mt-4 bg-white/60">
                  <div className="text-xs text-gray-500">Created {formatDate(plan.createdAt)}</div>
                  <div className="flex gap-2">
                    {plan.adminApproved ? (
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold ring-1 ring-green-300">
                        <CheckCircle className="w-4 h-4" /> Approved Plan
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => rejectQuick(plan._id)}
                          disabled={savingId === plan._id}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded-lg shadow-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveQuick(plan._id)}
                          disabled={savingId === plan._id}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm rounded-lg shadow-sm"
                        >
                          Approve
                        </button>
                        <button onClick={() => openReview(plan)} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow-sm">Review</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{plans.length}</div>
          <div className="text-gray-600">Total Plans</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{plans.filter((p) => getPlanStatus(p.schedule) === "Completed").length}</div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{plans.filter((p) => getPlanStatus(p.schedule) === "Overdue").length}</div>
          <div className="text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{plans.filter((p) => getPlanStatus(p.schedule) === "Active").length}</div>
          <div className="text-gray-600">Active</div>
        </div>
      </div>
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
    </div>
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

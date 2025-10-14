import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  Filter,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { getAllPlans, deletePlan as apiDeletePlan } from "../../api/installmentApi";

// Modal Component
const EditInstallmentPlanModal = ({
  plan,
  onClose,
  onSave,
  loading: saving,
}) => {
  const [formData, setFormData] = useState({
    totalInstallments: plan.totalInstallments,
    startDate: new Date(plan.startDate).toISOString().split("T")[0],
    downPayment: plan.downPayment,
    schedule: [...plan.schedule], // copy
  });

  // (moved business rule helpers to main component)

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Recalculate schedule when core fields change
  useEffect(() => {
    try {
      const n = parseInt(formData.totalInstallments, 10) || 0;
      if (!n) return;
      const start = new Date(formData.startDate);
      if (isNaN(start.getTime())) return;
      // robust parse for totals like "15,000.00" or with currency
      const parseMoney = (v) => {
        const num = parseFloat(String(v ?? 0).toString().replace(/[^0-9.\-]/g, ""));
        return isNaN(num) ? 0 : num;
      };
      const total = parseMoney(plan.totalAmount);
      const down = parseMoney(formData.downPayment);
      const remain = Math.max(0, total - down);
      // Even split with remainder cents distributed to first installments
      const base = Math.floor((remain / n) * 100) / 100; // 2dp floor
      let remainderCents = Math.round(remain * 100) - Math.round(base * 100) * n;

      const newSchedule = Array.from({ length: n }).map((_, i) => {
        const due = new Date(start);
        due.setMonth(due.getMonth() + i);
        // distribute 1 cent to first installments while remainder exists
        const extra = remainderCents > 0 ? 0.01 : 0;
        if (remainderCents > 0) remainderCents -= 1;
        return {
          installmentNumber: i + 1,
          amount: Number((base + extra).toFixed(2)),
          dueDate: due.toISOString().split("T")[0],
          status: plan.schedule?.[i]?.status || "Pending",
          paymentMethod: plan.schedule?.[i]?.paymentMethod,
        };
      });
      setFormData((prev) => ({ ...prev, schedule: newSchedule }));
    } catch (e) {
      // no-op
    }
  }, [formData.totalInstallments, formData.startDate, formData.downPayment, plan.totalAmount]);

  // moved helpers to main component below

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...plan,
      ...formData,
      startDate: new Date(formData.startDate),
      schedule: formData.schedule.map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Installment Plan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Course: <span className="font-medium">{plan.courseId}</span> •
            Total: {formatCurrency(plan.totalAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Level Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Installments
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalInstallments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalInstallments: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.downPayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    downPayment: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Schedule Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Installment Schedule</h3>
            <div className="space-y-3">
              {formData.schedule.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        # {item.installmentNumber}
                      </label>
                      <input
                        type="number"
                        disabled
                        value={item.installmentNumber}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "installmentNumber",
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Amount
                      </label>
                      <input
                        disabled
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "amount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={
                          new Date(item.dueDate).toISOString().split("T")[0]
                        }
                        disabled
                        onChange={(e) =>
                          handleScheduleChange(index, "dueDate", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Status
                      </label>
                      <select
                        value={item.status}
                        disabled
                        onChange={(e) =>
                          handleScheduleChange(index, "status", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                  {/* Helper note before DP approval */}
                  {!plan.downPaymentPaid && (
                    <div className="p-6 text-sm text-gray-600">
                      Complete your down payment and wait for admin approval to unlock the installment schedule.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const MyInstallmentPlans = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("rg_id") || localStorage.getItem("rg_userId");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("All"); // All, Pending, Active, Overdue, Completed
  const [expanded, setExpanded] = useState({}); // planId -> boolean
  const [deletingId, setDeletingId] = useState("");

  // Helpers here (used in render)
  const getNextDue = (plan) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const pending = plan.schedule
      .filter((i) => i.status === "Pending")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return pending.find((i) => new Date(i.dueDate) <= startOfToday) || pending[0] || null;
  };

  const getProgress = (plan) => {
    const total = plan.schedule.length || 1;
    const paid = plan.schedule.filter((i) => i.status === "Approved").length;
    return Math.round((paid * 100) / total);
  };

  // Business rules (global for page)
  // Overall status helper that includes admin approval and down payment
  const getOverallStatus = (plan) => {
    const approvedCount = plan.schedule.filter((i) => i.status === "Approved").length;
    const overdueCount = plan.schedule.filter((i) => i.status === "Overdue").length;
    if (!plan.adminApproved) return "Pending Approval";
    if (plan.adminApproved && !plan.downPaymentPaid) return "Down Payment Due";
    if (approvedCount === plan.schedule.length) return "Completed";
    if (overdueCount > 0) return "Overdue";
    return "Active";
  };
  const canPayPlan = (plan) => Boolean(plan?.adminApproved) && Boolean(plan?.downPaymentPaid);
  const within7DaysOrToday = (due) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const windowEnd = new Date(startOfToday);
    windowEnd.setDate(windowEnd.getDate() + 7);
    return new Date(due) <= windowEnd;
  };

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    if (!studentId) {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedPlans = await getAllPlans(studentId);
      setPlans(
        Array.isArray(fetchedPlans["plans"]) ? fetchedPlans["plans"] : []
      );
    } catch (err) {
      console.error("Failed to fetch installment plans:", err);
      setError("Failed to load your installment plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Save edited plan (mock for now - replace with actual API call)
  const handleSavePlan = async (updatedPlan) => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // const savedPlan = await updatePlan(updatedPlan._id, updatedPlan);
      // setPlans(prev => prev.map(p => p._id === savedPlan._id ? savedPlan : p));

      // For demo, just update locally
      setPlans((prev) =>
        prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
      );
      setEditingPlan(null);
      alert("Plan updated successfully!");
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete plan with rules and typed confirmation
  const handleDelete = async (plan) => {
    // Rules:
    // 1) Only allow deleting when overall status is Pending or Active
    // 2) No installments should be Approved
    const approvedCount = plan.schedule.filter((i) => i.status === "Approved").length;
    const overdueCount = plan.schedule.filter((i) => i.status === "Overdue").length;
    let overallStatus = "Pending";
    if (approvedCount === plan.schedule.length) overallStatus = "Completed";
    else if (overdueCount > 0) overallStatus = "Overdue";
    else overallStatus = "Active";

    if (!(overallStatus === "Pending" || overallStatus === "Active")) {
      alert("You can only delete Pending or Active plans.");
      return;
    }
    if (approvedCount > 0) {
      alert("Cannot delete a plan that has approved installments.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this installment plan? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(plan._id);
      await apiDeletePlan(plan._id);
      setPlans((prev) => prev.filter((p) => p._id !== plan._id));
    } catch (e) {
      console.error("Delete plan failed:", e);
      alert(`Failed to delete plan: ${e?.message || 'Unknown error'}`);
    } finally {
      setDeletingId("");
    }
  };

  // Filter and search logic
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      searchTerm === "" ||
      plan.courseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCourse === "" || plan.courseId === filterCourse;
    // Use overall plan status for filtering (not individual installment statuses)
    const ov = getOverallStatus(plan);
    const overallForFilter = ov === "Pending Approval" || ov === "Down Payment Due" ? "Pending" : ov;
    const matchesStatus = filterStatus === "" || overallForFilter === filterStatus;
    // Compute overall status for tab (map Pending Approval/Down Payment Due under Pending)
    const overallForTab = ov === "Pending Approval" || ov === "Down Payment Due" ? "Pending" : ov;
    const matchesTab = activeTab === "All" || overallForTab === activeTab;
    return matchesSearch && matchesFilter && matchesStatus && matchesTab;
  });

  // Get unique courses for filter dropdown
  const uniqueCourses = [...new Set(plans.map((p) => p.courseId))].filter(
    Boolean
  );

  // Format helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-700 bg-green-100";
      case "Overdue":
        return "text-red-700 bg-red-100";
      case "Pending":
        return "text-yellow-700 bg-yellow-100";
      case "Pending Approval":
        return "text-yellow-700 bg-yellow-100";
      case "Down Payment Due":
        return "text-blue-700 bg-blue-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  // Small badge component for schedule items
  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Approved":
        return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;
      case "Overdue":
        return <span className={`${base} bg-red-100 text-red-700`}>Overdue</span>;
      case "Pending":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your installment plans...</p>
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
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        

        {/* Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {['All','Pending','Active','Overdue','Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm border ${activeTab === tab ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by course or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            
          </div>
        </div>

        {/* No Plans */}
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Installment Plans Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterCourse || filterStatus
                ? "Try adjusting your filters."
                : "You haven't created any installment plans yet."}
          </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPlans.map((plan) => {
              const progress = getProgress(plan);
              const next = getNextDue(plan);
              const nextDisabled = !(
                next &&
                next.status === "Pending" &&
                within7DaysOrToday(next.dueDate) &&
                canPayPlan(plan)
              );
              const approvedCount = plan.schedule.filter((i) => i.status === "Approved").length;
              const overallStatus = getOverallStatus(plan);
              return (
                <div key={plan._id} className={`bg-white rounded-xl shadow-sm border ${overallStatus === 'Overdue' ? 'border-red-300' : 'border-gray-100'}`}>
                  {/* Card header */}
                  <div className="p-6">
                    {/* Row 1: Course + Stats */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Course</div>
                          <div className="text-xl font-semibold text-gray-900">{plan.courseId}</div>
                          <div className="text-xs text-gray-400">ID: {plan._id.slice(-6)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">Total</div>
                          <div className="font-semibold whitespace-nowrap min-w-[120px] text-base">{formatCurrency(plan.totalAmount)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">Down Payment</div>
                          <div className="font-semibold whitespace-nowrap min-w-[120px] text-base">{formatCurrency(plan.downPayment)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">Start Date</div>
                          <div className="font-semibold whitespace-nowrap min-w-[120px] text-base">{formatDate(plan.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 whitespace-nowrap mb-1">Status</div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(overallStatus)}`}>{overallStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Progress left, Actions right */}
                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="md:flex-1 min-w-[220px]">
                        <div className="text-xs text-gray-500 mb-1">Progress</div>
                        <div className="w-full h-2 bg-gray-200 rounded">
                          <div className="h-2 bg-orange-500 rounded" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-2 text-xs text-gray-500 whitespace-nowrap">{approvedCount}/{plan.schedule.length} paid</div>
                      </div>
                      <div className="flex gap-2 md:justify-end">
                      {/* Down Payment button (visible only until paid) */}
                      {plan.adminApproved && !plan.downPaymentPaid && (
                        <button
                          onClick={() => {
                            const amt = plan.downPayment;
                            const course = plan.courseId;
                            navigate(`/create-payment?totalAmount=${amt}&courseName=${encodeURIComponent(course)}&courseId=${encodeURIComponent(course)}&paymentType=Installment#normal`);
                          }}
                          title="Pay down payment now"
                          className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Pay Down Payment
                        </button>
                      )}
                      {(!plan.adminApproved) && (
                        <>
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan)}
                            disabled={deletingId === plan._id}
                            className={`px-4 py-2 rounded-lg border text-white ${deletingId === plan._id ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 border-red-500'}`}
                            title="Delete this plan"
                          >
                            {deletingId === plan._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [plan._id]: !prev[plan._id] }))}
                        disabled={!plan.downPaymentPaid}
                        title={plan.downPaymentPaid ? "Toggle schedule" : "Schedule unlocks after down payment is approved"}
                        className={`px-4 py-2 rounded-lg border flex items-center gap-1 ${!plan.downPaymentPaid ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-800'}`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded[plan._id] ? 'rotate-180' : ''}`} />
                        {expanded[plan._id] ? 'Hide' : 'Show'} Schedule
                      </button>
                      {/* Download and Contact buttons removed as requested */}
                      <button
                        onClick={() => {
                          if (!nextDisabled && next && plan.downPaymentPaid) {
                            const amt = next.amount;
                            const course = plan.courseId;
                            navigate(`/create-payment?totalAmount=${amt}&courseName=${encodeURIComponent(course)}&courseId=${encodeURIComponent(course)}&paymentType=Installment#normal`);
                          }
                        }}
                        disabled={nextDisabled || !plan.downPaymentPaid}
                        title={!plan.downPaymentPaid ? "Please complete and get approval for down payment first" : (nextDisabled ? (canPayPlan(plan) ? "Next installment not within 7 days" : (plan.adminApproved ? "Please pay down payment first" : "Requires admin approval")) : `Pay #${next?.installmentNumber}`)}
                        className={`px-4 py-2 rounded-lg text-white ${nextDisabled || !plan.downPaymentPaid ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                      >
                        {next ? `Pay Next (#${next.installmentNumber})` : 'No Due'}
                      </button>
                      </div>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="border-t" />
                  <div className={`p-6 ${plan.downPaymentPaid && expanded[plan._id] ? '' : 'hidden'}`}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Installment Schedule</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {plan.schedule.map((item) => {
                        const due = new Date(item.dueDate);
                        const disabled = !(
                          item.status === "Pending" &&
                          within7DaysOrToday(due) &&
                          canPayPlan(plan)
                        );
                        return (
                          <div key={item.installmentNumber} className="p-4 border rounded-lg bg-gray-50">
                            <div className="text-xs text-gray-500"># {item.installmentNumber}</div>
                            <div className="font-medium">{formatCurrency(item.amount)}</div>
                            <div className="text-xs text-gray-500 mt-1">{formatDate(item.dueDate)}</div>
                            <div className="mt-2">{getStatusBadge(item.status)}</div>
                            <button
                              onClick={() => {
                                if (disabled) return;
                                const amt = item.amount;
                                const course = plan.courseId;
                                navigate(`/create-payment?totalAmount=${amt}&courseName=${encodeURIComponent(course)}&courseId=${encodeURIComponent(course)}&paymentType=Installment#normal`);
                              }}
                              disabled={disabled}
                              title={disabled ? (!canPayPlan(plan) ? "Requires admin approval and down payment" : "Not within 7 days window or already paid") : "Pay this installment"}
                              className={`mt-3 w-full px-3 py-2 rounded text-white text-sm ${disabled ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
                            >
                              Pay Now
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Note</h4>
              <p className="text-sm text-blue-800 mt-1">
                You can edit installment amounts, dates, and statuses. Approved
                payments should not be modified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <EditInstallmentPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSavePlan}
          loading={saving}
        />
      )}
    </div>
  );
};

export default MyInstallmentPlans;

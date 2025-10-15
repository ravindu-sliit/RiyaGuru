import React, { useState, useEffect } from "react";
import { PaymentAPI } from "../../api/paymentApi";
import {
  Loader2,
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Wallet2 as Bank,
  Wallet,
  RefreshCw,
} from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [rejectionReasons, setRejectionReasons] = useState({});

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reviewComment, setReviewComment] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PaymentAPI.getAll();
      setPayments(Array.isArray(data["payments"]) ? data["payments"] : []);
    } catch (err) {
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mask card number to show only first 2 and last 4 digits (dots, no dash)
  const maskCardNumber = (num) => {
    const raw = String(num || "").replace(/\D/g, "");
    if (!raw) return "••••";
    const first = raw.slice(0, 2);
    const last = raw.slice(-4);
    const hiddenLen = Math.max(0, raw.length - 6);
    return `${first}${"•".repeat(hiddenLen)}${last}`;
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const isPDF = (slipURL) => slipURL ? /\.pdf(\?|#|$)/i.test(slipURL) : false;
  const handleStatusUpdate = async (paymentId, newStatus, comment = "") => {
    if (savingId) return;

    setSavingId(paymentId);

    try {
      const paymentToUpdate = payments.find((p) => p._id === paymentId);
      if (!paymentToUpdate) {
        throw new Error("Payment not found");
      }

      // Use admin endpoints for Approve / Reject (backend expects these)
      if (newStatus === "Approved") {
        await PaymentAPI.adminApprove(paymentId, comment);
      } else if (newStatus === "Rejected") {
        await PaymentAPI.adminReject(paymentId, comment);
      } else {
        // Fallback for any other status updates if needed
        const payload = {
          ...paymentToUpdate,
          status: newStatus,
          adminComment: comment,
          paidDate:
            newStatus === "Approved" ? new Date() : paymentToUpdate.paidDate,
        };
        await PaymentAPI.update(paymentId, payload);
      }

      fetchPayments();
      setSuccessMessage(`Payment ${newStatus.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      setRejectionReasons((prev) => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });
    } catch (err) {
      alert("Failed to update payment: " + (err.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  const handleRejectionReasonChange = (paymentId, value) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [paymentId]: value,
    }));
  };

  const openReview = (payment) => {
    setSelectedPayment(payment);
    setReviewComment("");
    setReviewOpen(true);
  };
  const closeReview = () => {
    setReviewOpen(false);
    setSelectedPayment(null);
    setReviewComment("");
  };

  const approveFromModal = async () => {
    if (!selectedPayment) return;
    try {
      setSavingId(selectedPayment._id);
      await PaymentAPI.adminApprove(selectedPayment._id, reviewComment);
      closeReview();
      await fetchPayments();
      setSuccessMessage("Payment approved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to approve: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  const rejectFromModal = async () => {
    if (!selectedPayment) return;
    try {
      setSavingId(selectedPayment._id);
      await PaymentAPI.adminReject(selectedPayment._id, reviewComment);
      closeReview();
      await fetchPayments();
      setSuccessMessage("Payment rejected successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      alert("Failed to reject: " + (e.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "" || payment.status === filterStatus;
    const matchesMethod =
      filterMethod === "" || payment.paymentMethod === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
    } catch {
      return `LKR ${Number(amount || 0).toFixed(2)}`;
    }
  };

  const formatDateParts = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    };
  };

  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (status) {
      case "Approved":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "Pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>
        );
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Card":
        return <CreditCard className="w-4 h-4" />;
      case "Bank":
        return <Bank className="w-4 h-4" />;
      case "Cash":
        return <Wallet className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
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
            onClick={fetchPayments}
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
                placeholder="Search by student, course, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Method Filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        {/* No Results */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Payments Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus || filterMethod
                ? "Try adjusting your filters."
                : "No payments in the system yet."}
            </p>
          </div>
        ) : (
          /* Payments Table */
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
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44 min-w-[11rem]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56 min-w-[14rem]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <React.Fragment key={payment._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {payment.studentName}
                          </div>
                          {payment.transactionId && (
                            <div className="text-xs text-gray-500 mt-1">
                              {payment.transactionId}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>{payment.courseName}</div>
                          <div className="text-xs text-gray-500">
                            {payment.paymentType}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span>{payment.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {(() => {
                            const created = formatDateParts(payment.createdAt);
                            const paid = payment.paidDate ? formatDateParts(payment.paidDate) : null;
                            return (
                              <div className="space-y-1.5 min-w-[10rem]">
                                {created ? (
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800">{created.date}</div>
                                    <div className="inline-flex items-center text-xs text-slate-600 bg-slate-100 rounded-full px-2 py-0.5 mt-0.5">{created.time}</div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">N/A</div>
                                )}
                                {paid && (
                                  <div className="text-xs text-emerald-700">
                                    <span className="inline-flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2 py-0.5 mr-1">Paid</span>
                                    <span>{paid.date}</span>
                                    <span className="ml-1 text-emerald-800">{paid.time}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "Pending" ? (
                            <div className="flex flex-col gap-2 min-w-[14rem]">
                              {/* Row 1: Review + Approve */}
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => openReview(payment)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      payment._id,
                                      "Approved",
                                      ""
                                    )
                                  }
                                  disabled={savingId === payment._id}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-green-200 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-60 transition-colors"
                                >
                                  {savingId === payment._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Approve
                                </button>
                              </div>
                              {/* Row 2: Reason input + Reject icon button */}
                              <div className="flex items-center gap-2 flex-1 min-w-[12rem]">
                                <input
                                  type="text"
                                  placeholder="Reason for rejection..."
                                  value={rejectionReasons[payment._id] || ""}
                                  onChange={(e) =>
                                    handleRejectionReasonChange(
                                      payment._id,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleStatusUpdate(
                                        payment._id,
                                        "Rejected",
                                        rejectionReasons[payment._id] || ""
                                      );
                                    }
                                  }}
                                  className="flex-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                                  disabled={savingId === payment._id}
                                />
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      payment._id,
                                      "Rejected",
                                      rejectionReasons[payment._id] || ""
                                    )
                                  }
                                  disabled={savingId === payment._id}
                                  className="p-2 border border-red-200 bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-700 rounded-md transition-colors"
                                  title="Reject with comment"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              Locked
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Card Details Row (Admin Only) */}
                      {false && payment.cardDetails && (
                        <tr className="bg-blue-50 border-t">
                          <td colSpan="7" className="px-6 py-3">
                            <div className="text-xs text-blue-800 font-medium mb-1">
                              🔒 Card Details (Masked)
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Card Number:</span>{" "}
                              {maskCardNumber(payment.cardDetails.cardNumber)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">
              {payments.length}
            </div>
            <div className="text-gray-600">Total Payments</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === "Approved").length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === "Rejected").length}
            </div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>
        {/* Review Modal Mount */}
        {reviewOpen && (
          <ReviewModal
            payment={selectedPayment}
            onClose={closeReview}
            onApprove={approveFromModal}
            onReject={rejectFromModal}
            comment={reviewComment}
            setComment={setReviewComment}
            saving={savingId === selectedPayment?._id}
          />
        )}
      </div>
  );
};

export default AdminPayments;

// Review Modal Component (inline for simplicity)
export const ReviewModal = ({ payment, onClose, onApprove, onReject, comment, setComment, saving }) => {
  if (!payment) return null;
  const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (d) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const isBank = payment.paymentMethod === "Bank";
  const isCard = payment.paymentMethod === "Card";
  const toAbsolute = (p) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const api = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const origin = api.replace(/\/?api\/?$/, "");
    return `${origin}${p.startsWith("/") ? p : `/${p}`}`;
  };
  const isPDF = payment?.slipURL ? /\.pdf(\?|#|$)/i.test(payment.slipURL) : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Student</h4>
            <div className="text-gray-900 font-medium">{payment.studentName || "N/A"}</div>
            <div className="text-sm text-gray-500">ID: {payment.studentId || "N/A"}</div>
            {payment.studentEmail && <div className="text-sm text-gray-500">Email: {payment.studentEmail}</div>}

            <h4 className="text-sm font-medium text-gray-600 mt-4 mb-1">Course</h4>
            <div className="text-gray-900 font-medium">{payment.courseName}</div>
            <div className="text-sm text-gray-500">{payment.paymentType}</div>

            <h4 className="text-sm font-medium text-gray-600 mt-4 mb-1">Payment</h4>
            <div className="text-gray-900 font-medium">{formatCurrency(payment.amount)}</div>
            <div className="text-sm text-gray-500">Method: {payment.paymentMethod}</div>
            {payment.transactionId && (
              <div className="text-sm text-gray-500">TXN: {payment.transactionId}</div>
            )}
            <div className="text-sm text-gray-500">Created: {formatDate(payment.createdAt)}</div>
          </div>

          <div>
            {isBank && payment.slipURL ? (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Uploaded Bank Slip</h4>
                <a href={toAbsolute(payment.slipURL)} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open in new tab</a>
                <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                  {isPDF ? (
                    <iframe
                      src={toAbsolute(payment.slipURL)}
                      title="Bank Slip PDF"
                      className="w-full h-64 rounded"
                    />
                  ) : (
                    <img
                      src={toAbsolute(payment.slipURL)}
                      alt="Bank Slip"
                      className="max-h-64 mx-auto object-contain"
                    />
                  )}
                </div>
              </div>
            ) : isCard && payment.cardDetails ? (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-900">
                <div className="font-medium mb-1">Card Details</div>
                <div>Card Number: {payment.cardDetails.cardNumber}</div>
                <div>Card Holder: {payment.cardDetails.cardHolder}</div>
                <div>Expiry: {payment.cardDetails.expiryDate}</div>
                <div>CVV: {payment.cardDetails.cvv}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No additional attachments</div>
            )}
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

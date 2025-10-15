import { useEffect, useState } from "react";
import { PaymentAPI } from "../../api/paymentApi";
import { StudentAPI } from "../../api/studentApi";
import {
  Loader2,
  AlertCircle,
  Trash2,
  CreditCard,
  Wallet2 as Bank,
  Wallet,
  Download,
  Search,
} from "lucide-react";

const MyPayments = () => {
  const studentId = localStorage.getItem("rg_userId");
  const possibleIds = [
    localStorage.getItem("rg_userId"),
    localStorage.getItem("studentId"),
    localStorage.getItem("userId"),
    localStorage.getItem("username"),
  ]
    .filter(Boolean)
    .map((v) => String(v).trim().toLowerCase());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch payments on mount
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const allPayments = await PaymentAPI.getAll();
        const list = Array.isArray(allPayments?.payments)
          ? allPayments.payments
          : Array.isArray(allPayments)
          ? allPayments
          : [];

        const sid = String(studentId || "").trim().toLowerCase();
        const filtered = list.filter((p) => {
          const candidates = [
            p.studentName,
            p.studentId,
            p.student_id,
            p.student,
            p.createdBy,
            p.created_by,
          ]
            .filter((v) => v != null)
            .map((v) => String(v).trim().toLowerCase());
          return (
            candidates.includes(sid) ||
            possibleIds.some((alt) => candidates.includes(alt))
          );
        });

        let matches = filtered;
        if (matches.length === 0 && studentId) {
          try {
            const res = await StudentAPI.getById(studentId);
            const student = res?.student || res;
            const fullName =
              student?.full_name ||
              student?.name ||
              `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
            if (fullName) {
              const nameVariants = [fullName, fullName.toLowerCase()];
              matches = list.filter((p) => {
                const cand = [p.studentName, p.student_name, p.name]
                  .filter(Boolean)
                  .map((v) => String(v));
                return cand.some(
                  (c) =>
                    nameVariants.includes(c) ||
                    nameVariants.includes(String(c).toLowerCase())
                );
              });
            }
          } catch (_) {}
        }

        const params = new URLSearchParams(window.location.search);
        const showAll = params.get("showAllPayments") === "1";
        const toShow = showAll ? list : matches;

        const sanitized = toShow.map((p) => {
          const { cardDetails, ...safePayment } = p;
          return safePayment;
        });

        setPayments(sanitized);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setError(
          "Failed to load your payment history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchPayments();
    } else {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
    }
  }, [studentId]);

  const handleDownloadReceipt = (paymentId) => {
    const url = `${API_BASE}/receipts/${paymentId}`;
    window.open(url, "_blank");
  };

  const openDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const handleDelete = async (paymentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment record? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(paymentId);

    try {
      await PaymentAPI.remove(paymentId);
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
    } catch (err) {
      console.error("Failed to delete payment:", err);
      alert("Failed to delete payment. It may be locked or already processed.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
      }).format(amount);
    } catch {
      const n = Number(amount || 0);
      return `LKR ${n.toFixed(2)}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusBadge = (status) => {
    const base =
      "px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ring-1";
    if (status === "Approved")
      return (
        <span className={`${base} bg-green-50 text-green-700 ring-green-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Approved
        </span>
      );
    if (status === "Rejected")
      return (
        <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Rejected
        </span>
      );
    if (status === "Pending")
      return (
        <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    return (
      <span
        className={`${base} bg-gray-50 text-gray-700 ring-gray-200`}
      >
        {status}
      </span>
    );
  };

  const rowAccent = (status) => {
    if (status === "Approved")
      return "border-l-4 border-green-400/70 bg-green-50/40";
    if (status === "Rejected")
      return "border-l-4 border-red-400/70 bg-red-50/40";
    if (status === "Pending")
      return "border-l-4 border-amber-400/70 bg-amber-50/40";
    return "border-l-4 border-slate-200";
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const fields = [
      p.courseName,
      p.paymentMethod,
      p.paymentType,
      p.status,
      p.transactionId,
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return fields.some((f) => f.includes(q));
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your payment history...</p>
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
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        {/* Separate Search Bar Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 border border-gray-200">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course, method, type, status or TXN..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Payments Found
            </h3>
            <p className="text-gray-500">
              You haven't made any payments yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gradient-to-r from-orange-50 to-transparent">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-52 min-w-[13rem]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className={`transition-colors hover:bg-white ${rowAccent(
                        payment.status
                      )}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {payment.courseName}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500 mt-1">
                            TXN: {payment.transactionId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                          {payment.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span>{payment.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div>
                          {getStatusBadge(payment.status)}
                          {payment.status === "Rejected" &&
                            payment.adminComment && (
                              <div className="mt-1 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 max-w-[22rem] break-words">
                                <span className="font-semibold">
                                  Reason:
                                </span>{" "}
                                {payment.adminComment}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2 min-w-[14rem] flex-nowrap">
                          <button
                            onClick={() => openDetails(payment)}
                            className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold py-1.5 px-2.5 rounded-md transition-colors whitespace-nowrap"
                            title="View details"
                          >
                            View
                          </button>
                          {payment.status === "Pending" && (
                            <button
                              onClick={() => handleDelete(payment._id)}
                              disabled={deletingId === payment._id}
                              className="inline-flex items-center gap-1.5 border border-red-300 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold py-1.5 px-2.5 rounded-md transition-colors"
                              title="Delete pending payment"
                            >
                              {deletingId === payment._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          )}
                          {payment.status === "Approved" && (
                            <button
                              onClick={() =>
                                handleDownloadReceipt(payment._id)
                              }
                              className="inline-flex items-center gap-1.5 border border-orange-300 bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs font-semibold py-1.5 px-2.5 rounded-md transition-colors"
                              title="Download receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50/80 rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">Note</h4>
              <p className="text-sm text-blue-800 mt-1">
                Only <span className="font-medium">Pending</span> payments can
                be deleted. Approved or Rejected payments are locked for
                record-keeping.
              </p>
              {payments.length > 0 && filteredPayments.length === 0 && (
                <p className="text-sm text-blue-800 mt-2">
                  No matches for your search.
                </p>
              )}
            </div>
          </div>
        </div>

        <PaymentDetailsModal
          open={detailsOpen}
          payment={selectedPayment}
          onClose={closeDetails}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getPaymentMethodIcon={getPaymentMethodIcon}
        />
      </div>
    </div>
  );
};

export default MyPayments;

// Details Modal
export const PaymentDetailsModal = ({
  open,
  payment,
  onClose,
  formatCurrency,
  formatDate,
  getStatusBadge,
  getPaymentMethodIcon,
}) => {
  if (!open || !payment) return null;
  const guidance = () => {
    if (payment.status !== "Rejected") return null;
    if (payment.paymentMethod === "Card")
      return "If your card was charged, a refund will be initiated by the office. Please allow 5–7 business days.";
    if (payment.paymentMethod === "Bank")
      return "If you already transferred funds, please contact the office with your slip reference to arrange a refund.";
    if (payment.paymentMethod === "Cash")
      return "Please visit the office regarding any refund or corrections.";
    return null;
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Course</div>
            <div className="text-gray-900 font-medium">{payment.courseName}</div>
            <div className="text-xs text-gray-500">{payment.paymentType}</div>

            <div className="mt-4 text-sm text-gray-600 mb-1">Amount</div>
            <div className="text-gray-900 font-medium">{formatCurrency(payment.amount)}</div>

            <div className="mt-4 text-sm text-gray-600 mb-1">Status</div>
            <div>{getStatusBadge(payment.status)}</div>
            {payment.status === "Rejected" && payment.adminComment && (
              <div className="mt-2 text-[12px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                Reason: {payment.adminComment}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Method</div>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              {getPaymentMethodIcon(payment.paymentMethod)}
              <span>{payment.paymentMethod}</span>
            </div>
            {payment.transactionId && (
              <div className="mt-2 text-sm text-gray-600">
                TXN: <span className="text-gray-900">{payment.transactionId}</span>
              </div>
            )}
            <div className="mt-4 text-sm text-gray-600 mb-1">Created</div>
            <div className="text-gray-900">{formatDate(payment.createdAt)}</div>

            {guidance() && (
              <div className="mt-4 text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-2">
                {guidance()}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 pb-6 flex items-center justify-between">
          <a href="/student/inquiries" className="text-sm text-blue-700 hover:underline">
            Have a doubt? Create an inquiry
          </a>
          <button onClick={onClose} className="px-3 py-2 border rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

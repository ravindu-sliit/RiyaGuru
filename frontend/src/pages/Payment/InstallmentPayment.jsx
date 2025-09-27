import { useState } from "react";
import { createPlan } from "../../api/installmentApi";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstallmentPayment = ({ totalAmount, courseName, courseId }) => {
  const studentId = localStorage.getItem("rg_userId");
  const navigate = useNavigate();

  // Form State
  const [installments, setInstallments] = useState("");
  const [startDate, setStartDate] = useState("");
  const [downPayment, setDownPayment] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Validation 
  const allowedInstallments = [3, 4, 5, 6];

  const amountRegex = /^\d*\.?\d{0,2}$/; // Allow decimals up to 2 places
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Derived schedule preview
  const schedulePreview = (() => {
    try {
      const n = Number(installments);
      if (!allowedInstallments.includes(n)) return [];
      if (!startDate) return [];
      const parsedDown = downPayment === "" ? 0 : parseFloat(downPayment);
      const remain = Number(totalAmount || 0) - (isNaN(parsedDown) ? 0 : parsedDown);
      if (remain < 0) return [];
      const per = n > 0 ? remain / n : 0;
      const arr = [];
      for (let i = 0; i < n; i++) {
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i);
        arr.push({
          installmentNumber: i + 1,
          amount: Number(per.toFixed(2)),
          dueDate: due,
        });
      }
      return arr;
    } catch { return []; }
  })();

  // Validate form before submission
  const validateForm = () => {
    let isValid = true;
    let errorMsg = "";

    if (!installments || !allowedInstallments.includes(Number(installments))) {
      errorMsg = "Please select 3, 4, 5, or 6 installments.";
      isValid = false;
    } else if (!startDate || startDate < today) {
      errorMsg = "Start date must be today or later.";
      isValid = false;
    } else if (
      downPayment !== "" &&
      (!amountRegex.test(downPayment) ||
        parseFloat(downPayment) < 0 ||
        parseFloat(downPayment) > totalAmount)
    ) {
      errorMsg = `Down payment must be between $0 and ${totalAmount}.`;
      isValid = false;
    }

    setError(errorMsg);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const numInstallments = parseInt(installments, 10);
      const parsedDownPayment =
        downPayment === "" ? 0 : parseFloat(downPayment);
      const remaining = totalAmount - parsedDownPayment;

      if (remaining < 0) {
        throw new Error("Down payment cannot exceed total amount.");
      }

      // Generate schedule (simplified: equal installments, monthly)
      const schedule = [];
      const installmentAmount = remaining / numInstallments;

      for (let i = 0; i < numInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedule.push({
          installmentNumber: i + 1,
          amount: parseFloat(installmentAmount.toFixed(2)),
          dueDate,
          status: "Pending",
          receiptURL: null, // explicitly set to null as requested
        });
      }

      const planData = {
        studentId,
        courseId: courseId || null,
        totalAmount,
        downPayment: parsedDownPayment,
        //remainingAmount: remaining,
        totalInstallments: numInstallments,
        startDate: new Date(startDate),
        // schedule,
      };

      const result = await createPlan(planData);

      if (result.error) {
        throw new Error(result.message || "Failed to create installment plan.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-installments", {
          state: {
            planId: result._id || result.id,
            courseName,
            totalAmount,
            installments: numInstallments,
          },
        });
      }, 2000);
    } catch (err) {
      console.error("Create Plan Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Installments
          </h1>
          <p className="text-gray-600">
            For course: <span className="font-medium">{courseName}</span> •
            Total:{" "}
            <span className="font-bold text-orange-600">
              {formatCurrency(totalAmount)}
            </span>
          </p>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-medium">
                Installment plan created successfully!
              </span>
            </div>
            <p className="text-green-700 mt-2 text-sm">
              Redirecting to confirmation...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h4 className="font-semibold text-blue-900 mb-2">Installment Guidelines</h4>
          <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
            <li>You can select 3, 4, 5, or 6 monthly installments.</li>
            <li>First payment due date must be today or later.</li>
            <li>If a down payment is required, it must be paid now.</li>
            <li>Each installment is due within 7 days of the due date.</li>
            <li>Please pay installments on or before the due date to avoid delays.</li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Installments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Installments <span className="text-red-500">*</span>
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select installments</option>
                {allowedInstallments.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Only 3, 4, 5, or 6 installments are permitted.</p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Payment Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be today or later.
              </p>
            </div>

            {/* Down Payment (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={downPayment}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || amountRegex.test(value)) {
                      setDownPayment(value);
                    }
                  }}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be between $0 and {formatCurrency(totalAmount)}.
              </p>
            </div>

            {/* Preview Schedule */}
            {schedulePreview.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Preview Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedulePreview.map((item) => (
                    <div key={item.installmentNumber} className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm text-gray-600"># {item.installmentNumber}</div>
                      <div className="font-medium">Amount: {formatCurrency(item.amount)}</div>
                      <div className="text-sm text-gray-600">
                        Due: {new Date(item.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  Down Payment: <span className="font-medium">{formatCurrency(downPayment === "" ? 0 : parseFloat(downPayment || 0))}</span> • Remaining: <span className="font-medium">{formatCurrency(Math.max(0, (Number(totalAmount || 0) - (parseFloat(downPayment || 0) || 0))) )}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Plan...
                </>
              ) : (
                "Create Installment Plan"
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Important</h4>
              <p className="text-sm text-blue-800 mt-1">
                Payments will be due monthly starting from the selected date.
                You can pay installments early if desired.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallmentPayment;

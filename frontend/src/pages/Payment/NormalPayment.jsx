import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { PaymentAPI } from "../../api/paymentApi";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "../../api/studentApi";
import { CourseAPI } from "../../api/courseApi";
import { StudentCourseAPI } from "../../api/studentCourseApi";

const NormalPayment = ({ totalAmount, courseName, courseId, studentId, onSwitchTab, initialPaymentType, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: studentId, // keep storing studentId in studentName as backend expects
    courseName: courseName,
    amount: totalAmount || "",
    paymentType: initialPaymentType === 'Installment' ? 'Installment' : 'Full',
    paymentMethod: "Card",
    cardDetails: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
    slipURL: "",
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slipPreview, setSlipPreview] = useState({ url: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [studentNameResolved, setStudentNameResolved] = useState("");
  const [serverError, setServerError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  const validationRules = {
    cardNumber: /^[0-9]{16}$/,
    cardHolder: /^[a-zA-Z\s]{2,50}$/,
    expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    cvv: /^[0-9]{3}$/,
    studentName: /^.{2,}$/,
    amount: /^[0-9]+(\.[0-9]{1,2})?$/,
  };

  // Fetch Student Name by studentId (rg_userId). If /students/:id fails, fall back to /students and match by student_id.
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!studentId) return;
        try {
          const res = await StudentAPI.getById(studentId);
          const student = res?.student || res;
          const fullName =
            student?.full_name ||
            student?.name ||
            `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
          if (fullName) return setStudentNameResolved(fullName);
        } catch (_e) {
          // fallback: try GET /students and match student_id
          const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
          const token = localStorage.getItem("token") || localStorage.getItem("rg_token");
          const res = await fetch(`${API_BASE}/students`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json?.students) ? json.students : Array.isArray(json) ? json : [];
            const found = list.find(
              (s) => String(s.studentId || s.student_id || s.id || s._id) === String(studentId)
            );
            if (found) {
              const fullName =
                found.full_name || found.name || `${found.firstName || ""} ${found.lastName || ""}`.trim();
              setStudentNameResolved(fullName || "");
            }
          }
        }
      } catch (e) {
        // ignore name fetch errors; keep empty
      }
    };
    fetchStudent();
  }, [studentId]);

  // Auto-fill Amount from Course table if 0/empty
  useEffect(() => {
    const resolveAmount = async () => {
      try {
        // Only resolve if current amount is falsy or 0
        const current = parseFloat(String(formData.amount || 0));
        if (!isNaN(current) && current > 0) return;
        let priceCandidate = null;
        // 1) Try direct lookup by id
        if (courseId) {
          try {
            const byId = await CourseAPI.getById(courseId);
            const courseData = byId?.course || byId;
            priceCandidate = courseData?.price ?? courseData?.amount ?? null;
          } catch (_) {}
        }
        // 2) Try direct lookup by name
        if (priceCandidate == null && courseName) {
          try {
            const byName = await CourseAPI.getById(courseName);
            const courseData = byName?.course || byName;
            priceCandidate = courseData?.price ?? courseData?.amount ?? null;
          } catch (_) {}
        }
        // 3) Fallback to list search
        if (priceCandidate == null) {
          const all = await CourseAPI.getAll();
          const list = Array.isArray(all?.courses) ? all.courses : Array.isArray(all) ? all : [];
          const targets = [courseId, courseName].filter(Boolean).map((v) => String(v).toLowerCase());
          const found = list.find((c) => {
            const candidates = [c?.name, c?.course_name, c?.title, c?._id, c?.id]
              .filter(Boolean)
              .map((v) => String(v).toLowerCase());
            return targets.some((t) => candidates.includes(t));
          });
          priceCandidate = found?.price ?? found?.amount ?? null;
        }
        if (priceCandidate != null) {
          setFormData((prev) => ({ ...prev, amount: String(priceCandidate) }));
        }
      } catch (e) {
        // ignore
      }
    };
    resolveAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, courseName]);

  // Fallback amount: resolve from student's enrollments if still 0
  useEffect(() => {
    const resolveFromEnrollments = async () => {
      try {
        const current = parseFloat(String(formData.amount || 0));
        if (!isNaN(current) && current > 0) return;
        const sid = studentId || localStorage.getItem("rg_userId");
        if (!sid) return;
        const res = await StudentCourseAPI.getByStudentId(sid);
        const list = Array.isArray(res) ? res : res?.data || [];
        const norm = (s) => String(s || "").trim().toLowerCase();
        const targets = [courseId, courseName].filter(Boolean).map(norm);
        const match = list.find((c) => {
          const candId = norm(c?.course_id);
          const candName = norm(c?.course_name || c?.courseId || c?.title);
          return targets.some((t) => t && (t === candId || t === candName));
        });
        const price = match?.courseData?.[0]?.price;
        if (price != null) setFormData((prev) => ({ ...prev, amount: String(price) }));
      } catch (e) {
        // ignore
      }
    };
    resolveFromEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId, courseName, formData.amount]);

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (name === "cardNumber" && formData.paymentMethod === "Card") {
      if (!validationRules.cardNumber.test(value.replace(/\s/g, ""))) {
        return "Card number must be 16 digits";
      }
    }

    if (name === "cardHolder" && formData.paymentMethod === "Card") {
      if (!validationRules.cardHolder.test(value)) {
        return "Card holder name must contain only letters and spaces (2-50 characters)";
      }
    }

    if (name === "expiryDate" && formData.paymentMethod === "Card") {
      // Accept MM/YY or YYYY-MM
      const mmYY = /^(0[1-9]|1[0-2])\/\d{2}$/;
      const yyyyMM = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!mmYY.test(value) && !yyyyMM.test(value)) {
        return "Expiry must be a valid month";
      }
      // Not in the past
      const now = new Date();
      let expY, expM;
      if (yyyyMM.test(value)) {
        const [y, m] = value.split("-").map(Number);
        expY = y;
        expM = m;
      } else {
        const [m, y] = value.split("/");
        expM = Number(m);
        expY = 2000 + Number(y);
      }
      const expDate = new Date(expY, expM - 1, 1);
      const curMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (expDate < curMonth) return "Expiry cannot be in the past";
    }

    if (name === "cvv" && formData.paymentMethod === "Card") {
      if (!validationRules.cvv.test(value)) {
        return "CVV must be 3 digits";
      }
    }

    if (name === "studentName") {
      if (!validationRules.studentName.test(value)) {
        return "Student name must contain only letters and spaces (2-50 characters)";
      }
    }

    if (name === "amount") {
      if (!validationRules.amount.test(value)) {
        return "Amount must be a valid number";
      }
      if (parseFloat(value) <= 0) {
        return "Amount must be greater than 0";
      }
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("card.")) {
      const cardField = name.split(".")[1];
      // Sanitize CVV: only digits, max 3
      const nextValue = cardField === "cvv" ? value.replace(/\D/g, "").slice(0, 3) : value;
      setFormData((prev) => ({
        ...prev,
        cardDetails: {
          ...prev.cardDetails,
          [cardField]: nextValue,
        },
      }));

      const error = validateField(cardField, nextValue);
      setErrors((prev) => ({
        ...prev,
        [`card.${cardField}`]: error,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle bank slip file upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (jpg/png/pdf, max 20MB)
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, slipURL: "Only jpg, png, or pdf files are allowed" }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, slipURL: "File size must be 20MB or less" }));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setErrors((prev) => ({ ...prev, slipURL: null }));
      const res = await PaymentAPI.uploadSlip(file, (pct) => setUploadProgress(pct));
      if (res?.path) {
        setFormData((prev) => ({ ...prev, slipURL: res.path }));
        // preview using local object URL for immediate feedback
        if (file.type.startsWith("image/")) {
          setSlipPreview({ url: URL.createObjectURL(file), type: "image" });
        } else if (file.type === "application/pdf") {
          setSlipPreview({ url: res.path, type: "pdf" });
        } else {
          setSlipPreview({ url: "", type: "" });
        }
      } else {
        setErrors((prev) => ({ ...prev, slipURL: "Upload failed. Please try again." }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, slipURL: "Upload failed. Please try again." }));
    } finally {
      setUploading(false);
    }
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      handleInputChange({
        target: { name: "card.cardNumber", value: formatted },
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setServerError("");

    // Validate all fields
    const newErrors = {};

    // Required fields validation
    if (!formData.studentName)
      newErrors.studentName = "Student ID is required";
    if (!formData.courseName) newErrors.courseName = "Course name is required";
    if (!formData.amount) newErrors.amount = "Amount is required";

    // Card specific validations
    if (formData.paymentMethod === "Card") {
      if (!formData.cardDetails.cardNumber)
        newErrors["card.cardNumber"] = "Card number is required";
      if (!formData.cardDetails.cardHolder)
        newErrors["card.cardHolder"] = "Card holder name is required";
      if (!formData.cardDetails.expiryDate)
        newErrors["card.expiryDate"] = "Expiry date is required";
      if (!formData.cardDetails.cvv) newErrors["card.cvv"] = "CVV is required";
    }

    // Bank transfer validation
    if (formData.paymentMethod === "Bank" && !formData.slipURL) {
      newErrors.slipURL = "Bank slip URL is required";
    }

    // Run regex validations
    Object.keys(formData).forEach((key) => {
      if (key !== "cardDetails" && formData[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (formData.paymentMethod === "Card") {
      Object.keys(formData.cardDetails).forEach((key) => {
        if (formData.cardDetails[key]) {
          const error = validateField(key, formData.cardDetails[key]);
          if (error) newErrors[`card.${key}`] = error;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare payload
      const mapCourseName = (name) => {
        const n = String(name || "").trim().toLowerCase();
        if (n === "car") return "Car";
        if (n === "van") return "Van";
        if (n === "heavy vehicle" || n === "heavy" || n === "heavy-vehicle") return "Heavy Vehicle";
        if (n === "light vehicle" || n === "light" || n === "light-vehicle") return "Light Vehicle";
        if (n === "motor bicycle" || n === "motor-bicycle" || n === "motor bike" || n === "motorbike" || n === "motorcycle" || n === "motor cycle") return "Motor Bicycle";
        if (n === "three wheeler" || n === "three-wheeler" || n === "threewheel" || n === "tuk" || n === "tuk tuk") return "Three Wheeler";
        // default: return as-is; backend may reject if not in enum
        return name;
      };
      const payload = {
        studentName: formData.studentName, // holds studentId by design
        courseName: mapCourseName(formData.courseName),
        amount: parseFloat(formData.amount),
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === "Card") {
        // Normalize expiry to MM/YY if value comes as YYYY-MM
        let expiry = formData.cardDetails.expiryDate;
        if (/^\d{4}-\d{2}$/.test(expiry)) {
          const [y, m] = expiry.split("-");
          expiry = `${m}/${y.slice(-2)}`;
        }
        payload.cardDetails = {
          cardNumber: formData.cardDetails.cardNumber.replace(/\s/g, ""),
          cardHolder: formData.cardDetails.cardHolder,
          expiryDate: expiry,
          cvv: formData.cardDetails.cvv,
        };
      }

      if (formData.paymentMethod === "Bank") {
        payload.slipURL = formData.slipURL;
      }

      // Make API call
      const response = await PaymentAPI.create(payload);
      console.log("Payment payload:", payload);

      console.log(response);

      // Build success info with date/time and amount/method
      try {
        const createdAtRaw = response?.payment?.createdAt || response?.data?.createdAt || response?.createdAt;
        const when = createdAtRaw ? new Date(createdAtRaw) : new Date();
        setSuccessInfo({
          date: when,
          amount: (() => { const n = parseFloat(formData.amount); return Number.isFinite(n) ? n : undefined; })(),
          paymentMethod: formData.paymentMethod,
        });
      } catch (_) {
        setSuccessInfo({ date: new Date(), amount: (() => { const n = parseFloat(formData.amount); return Number.isFinite(n) ? n : undefined; })(), paymentMethod: formData.paymentMethod });
      }
      if (typeof onSuccess === "function") {
        try { onSuccess(); } catch (_) {}
      }
      setSuccess(true);
      setFormData({
        studentName: "",
        courseName: "",
        amount: totalAmount || "",
        paymentType: "Full",
        paymentMethod: "Card",
        cardDetails: {
          cardNumber: "",
          cardHolder: "",
          expiryDate: "",
          cvv: "",
        },
        slipURL: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Payment failed:", error);
      let msg = error?.response?.data?.message || error?.message || "Payment failed. Please try again.";
      // Add hint if it's an enum error for courseName
      const details = error?.response?.data || {};
      if (String(msg).toLowerCase().includes("validation") || String(msg).toLowerCase().includes("enum")) {
        msg = `${msg}. Tip: courseName must be one of: Car, Van, Heavy Vehicle, Light Vehicle, Motor Bicycle, Three Wheeler.`;
      }
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const when = successInfo?.date ? new Date(successInfo.date) : new Date();
    const dateStr = when.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
    const timeStr = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: undefined });
    const amountStr = (() => {
      const n = successInfo?.amount;
      if (typeof n === "number") {
        try { return new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR" }).format(n); } catch { return `Rs ${n.toFixed(2)}`; }
      }
      return "-";
    })();
    return (
      <div className="relative py-12 bg-gradient-to-b from-slate-50 to-white">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-64 h-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -right-10 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl" />
        {/* Box 1: Success confirmation */}
        <div className="relative text-center bg-white/95 backdrop-blur rounded-2xl shadow-xl max-w-2xl mx-auto px-8 py-10 border border-gray-100">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 opacity-20 blur-xl" />
            <div className="relative w-full h-full rounded-full ring-4 ring-green-100 flex items-center justify-center bg-green-500 animate-pulse">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Success</span>
          <h2 className="text-2xl font-extrabold mb-2 text-slate-900">
            Payment Submitted Successfully!
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Your payment has been submitted and is being processed. You will receive a confirmation shortly.
          </p>
        </div>

        {/* Box 2: Summary */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent">
            <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 text-gray-500 bg-white">Payment Date</div>
              <div className="px-6 py-4 font-medium bg-white">{dateStr}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 text-gray-500 bg-slate-50">Payment Time</div>
              <div className="px-6 py-4 font-medium bg-slate-50">{timeStr}</div>
            </div>
            {successInfo?.paymentMethod && (
              <div className="grid grid-cols-2">
                <div className="px-6 py-4 text-gray-500 bg-white">Payment Method</div>
                <div className="px-6 py-4 font-medium bg-white">{successInfo.paymentMethod}</div>
              </div>
            )}
            {courseName && (
              <div className="grid grid-cols-2">
                <div className="px-6 py-4 text-gray-500 bg-slate-50">Course</div>
                <div className="px-6 py-4 font-medium bg-slate-50">{courseName}</div>
              </div>
            )}
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 text-gray-500 bg-white">Amount</div>
              <div className="px-6 py-4 font-semibold text-emerald-700 bg-white">{amountStr}</div>
            </div>
          </div>
          <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-3 bg-gradient-to-r from-white to-orange-50">
            <button
              onClick={() => {
                setSuccess(false);
                navigate("/my-payments");
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              My Payments
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 py-3 px-6 rounded-xl shadow-sm transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-xl shadow-sm transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Information */}
      <div
        className="bg-gray-50 rounded-xl p-6"
        style={{ backgroundColor: "#F5F6FA" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0A1A2F" }}>
          Student Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Student ID *
            </label>
            <input
              type="text"
              value={studentId || ""}
              disabled
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                errors.studentName
                  ? "border-red-500"
                  : "border-gray-200 focus:border-orange-400"
              }`}
              placeholder="Student ID"
            />
            {errors.studentName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.studentName}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Student Name
            </label>
            <input
              type="text"
              value={studentNameResolved}
              disabled
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                false
                  ? "border-red-500"
                  : "border-gray-200 focus:border-orange-400"
              }`}
              placeholder="Student Name"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Course ID
            </label>
            <input
              type="text"
              value={courseId || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              disabled
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                errors.courseName
                  ? "border-red-500"
                  : "border-gray-200 focus:border-orange-400"
              }`}
              placeholder="Course name"
            />
            {errors.courseName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.courseName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div
        className="bg-gray-50 rounded-xl p-6"
        style={{ backgroundColor: "#F5F6FA" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0A1A2F" }}>
          Payment Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              readOnly
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                errors.amount
                  ? "border-red-500"
                  : "border-gray-200 focus:border-orange-400"
              }`}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.amount}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
          {initialPaymentType === 'Installment' ? (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#0A1A2F" }}>
                Payment Type
              </label>
              <div className="px-4 py-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-800 font-medium">
                Installment (Down Payment)
              </div>
            </div>
          ) : (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0A1A2F" }}
              >
                Pay As *
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, paymentType: value }));
                  if (value === "Installment" && typeof onSwitchTab === "function") {
                    onSwitchTab("installment");
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-400 transition-colors"
              >
                <option value="Full">Full</option>
                <option value="Installment">Installment</option>
              </select>
            </div>
          )}
        </div>

        {/* close outer grid for Amount + Payment Type */}
        </div>

        {/* Payment Method (shown for both Full and Installment) */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#0A1A2F" }}
            >
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-400 transition-colors"
            >
              <option value="Card">Credit/Debit Card</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Details */}
      {formData.paymentMethod === "Card" && (
        <div
          className="bg-gray-50 rounded-xl p-6"
          style={{ backgroundColor: "#F5F6FA" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6" style={{ color: "#F47C20" }} />
            <h3 className="text-lg font-semibold" style={{ color: "#0A1A2F" }}>
              Card Details
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0A1A2F" }}
              >
                Card Number *
              </label>
              <input
                type="text"
                value={formData.cardDetails.cardNumber}
                onChange={handleCardNumberChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors["card.cardNumber"]
                    ? "border-red-500"
                    : "border-gray-200 focus:border-orange-400"
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors["card.cardNumber"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors["card.cardNumber"]}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0A1A2F" }}
              >
                Card Holder Name *
              </label>
              <input
                type="text"
                name="card.cardHolder"
                value={formData.cardDetails.cardHolder}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors["card.cardHolder"]
                    ? "border-red-500"
                    : "border-gray-200 focus:border-orange-400"
                }`}
                placeholder="John Doe"
              />
              {errors["card.cardHolder"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors["card.cardHolder"]}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0A1A2F" }}
              >
                Expiry Date *
              </label>
              {(() => {
                // Enforce selecting year 2025 onwards
                const min = `2025-01`;
                // Convert stored MM/YY to YYYY-MM for display if needed
                const val = (() => {
                  const v = formData.cardDetails.expiryDate;
                  if (/^\d{4}-\d{2}$/.test(v)) return v;
                  if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) {
                    const [m, y] = v.split("/");
                    return `20${y}-${m}`;
                  }
                  return "";
                })();
                return (
                  <input
                    type="month"
                    name="card.expiryDate"
                    min={min}
                    value={val}
                    onChange={(e) => {
                      const v = e.target.value; // YYYY-MM
                      setFormData((prev) => ({
                        ...prev,
                        cardDetails: { ...prev.cardDetails, expiryDate: v },
                      }));
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors["card.expiryDate"]
                        ? "border-red-500"
                        : "border-gray-200 focus:border-orange-400"
                    }`}
                    placeholder="YYYY-MM"
                  />
                );
              })()}
              {errors["card.expiryDate"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors["card.expiryDate"]}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#0A1A2F" }}
              >
                CVV *
              </label>
              <input
                type="password"
                name="card.cvv"
                value={formData.cardDetails.cvv}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors["card.cvv"]
                    ? "border-red-500"
                    : "border-gray-200 focus:border-orange-400"
                }`}
                placeholder="123"
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength="3"
                title="CVV must be exactly 3 digits"
              />
              {errors["card.cvv"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors["card.cvv"]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {formData.paymentMethod === "Bank" && (
        <div
          className="bg-gray-50 rounded-xl p-6"
          style={{ backgroundColor: "#F5F6FA" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-6 h-6" style={{ color: "#2D74C4" }} />
            <h3 className="text-lg font-semibold" style={{ color: "#0A1A2F" }}>
              Bank Transfer Details
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Please upload a clear bank slip. Max size 20MB. Accepted formats: JPG, PNG, or PDF.
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="w-full"
            />
            {uploading && (
              <div className="w-full">
                <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading slip... {uploadProgress}%
                </p>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-orange-500 rounded" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            {formData.slipURL && (
              <div className="text-sm text-green-700">
                Uploaded: {formData.slipURL}
                {slipPreview.type === "image" && (
                  <div className="mt-2">
                    <img src={slipPreview.url} alt="Slip preview" className="max-h-40 rounded border" />
                  </div>
                )}
                {slipPreview.type === "pdf" && (
                  <div className="mt-2">
                    <a href={slipPreview.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View PDF</a>
                  </div>
                )}
              </div>
            )}
            {errors.slipURL && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.slipURL}
              </p>
            )}
          </div>
        </div>
      )}

      {formData.paymentMethod === "Cash" && (
        <div className="bg-gray-50 rounded-xl p-6" style={{ backgroundColor: "#F5F6FA" }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A1A2F" }}>Cash Payment Instructions</h3>
          <p className="text-sm text-gray-700">
            Visit our branch and pay directly to activate your booking. Office address:
          </p>
          <div className="mt-2 text-sm text-gray-800">
            123 Main Street, Colombo<br />
            Mon–Fri: 9:00 AM – 5:00 PM | Sat: 9:00 AM – 1:00 PM
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        {serverError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {serverError}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Submit Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NormalPayment;

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterStudent() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    full_name: "",
    nic: "",
    phone: "",
    birthyear: "",
    gender: "",
    address: "",
    email: "",
    password: "",
  });

  // Only store FIRST visible error at a time:
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Refs to focus on server-side dup errors
  const emailRef = useRef(null);
  const nicRef = useRef(null);
  const phoneRef = useRef(null);

  const API_BASE = "http://localhost:5000";

  // ------------- Validators (single-field) -------------
  const validators = {
    full_name: (v) => {
      if (!v.trim()) return "Full name is required";
      return /^[A-Za-z ]+$/.test(v.trim())
        ? ""
        : "Only English letters (and spaces) are allowed";
    },
    nic: (v) => {
      const val = v.trim().toUpperCase();
      if (!val) return "NIC is required";
      return /^(\d{12}|\d{9}V)$/.test(val)
        ? ""
        : "NIC must be 12 digits OR 9 digits followed by 'V'";
    },
    phone: (v) => {
      const val = v.trim();
      if (!val) return "Phone number is required";
      return /^(0\d{9}|\d{9})$/.test(val)
        ? ""
        : "Enter 9 digits (or 0 followed by 9 digits)";
    },
    birthyear: (v) => {
      const val = String(v).trim();
      if (!val) return "Birth year is required";
      if (!/^\d{4}$/.test(val)) return "Birth year must be a 4-digit number";
      const yearNum = Number(val);
      const thisYear = new Date().getFullYear();
      const minYear = thisYear - 18;
      if (yearNum < 1900 || yearNum > thisYear)
        return `Birth year must be between 1900 and ${thisYear}`;
      if (yearNum > minYear)
        return "You must be at least 18 years old to register";
      return "";
    },
    gender: () => "",
    address: (v) => {
      const val = v.trim();
      if (!val) return "Address is required";
      if (val.length < 5) return "Address is too short";
      return /^[A-Za-z0-9\s,.\-/#]+$/.test(val)
        ? ""
        : "Address contains invalid characters";
    },
    email: (v) => {
      const val = v.trim();
      if (!val) return "Email is required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        ? ""
        : "Enter a valid email address";
    },
    password: (v) => {
      if (!v) return "Password is required";
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v)
        ? ""
        : "Min 6 chars incl. 1 uppercase, 1 lowercase, 1 number, 1 special";
    },
  };

  // Order to validate on submit (first error wins)
  const fieldOrder = [
    "full_name",
    "nic",
    "phone",
    "birthyear",
    "gender",
    "address",
    "email",
    "password",
  ];

  // Validate first invalid field only
  const validateFirstError = () => {
    for (const name of fieldOrder) {
      const v = inputs[name] ?? "";
      const msg = validators[name] ? validators[name](v) : "";
      if (msg) {
        setErrors({ [name]: msg });
        // focus the field
        const el = document.getElementById(name);
        el?.focus?.();
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextVal = name === "nic" ? value.toUpperCase() : value;
    setInputs((prev) => ({ ...prev, [name]: nextVal }));

    // if the currently shown error is for this field, revalidate it live
    if (errors[name]) {
      const msg = validators[name] ? validators[name](nextVal) : "";
      setErrors(msg ? { [name]: msg } : {});
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Only validate on blur if this field currently has the visible error
    if (errors[name]) {
      const msg = validators[name] ? validators[name](value) : "";
      setErrors(msg ? { [name]: msg } : {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // client-side: show only the first error
    const ok = validateFirstError();
    if (!ok) return;

    setSubmitting(true);
    try {
      const payload = {
        ...inputs,
        birthyear: Number(inputs.birthyear),
        nic: inputs.nic.trim().toUpperCase(),
        email: inputs.email.trim().toLowerCase(),
        phone: inputs.phone.trim(),
        address: inputs.address.trim(),
        full_name: inputs.full_name.trim(),
      };

      const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          // Backend returns { message, field }
          setSubmitError(data.message || "Duplicate value.");
          const f = String(data.field || "").toLowerCase();
          if (f === "email") emailRef.current?.focus();
          else if (f === "nic") nicRef.current?.focus();
          else if (f === "phone") phoneRef.current?.focus();
          return;
        }

        throw new Error(data.message || `Request failed (${res.status})`);
      }

      // Send OTP
      const otpRes = await fetch(`${API_BASE}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email }),
      });
      const otpData = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) {
        throw new Error(otpData.message || `Failed to send OTP (${otpRes.status})`);
      }

      navigate("/otp-request", { state: { email: payload.email }, replace: true });
    } catch (err) {
      setSubmitError(err.message || "Registration or OTP sending failed");
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p style={{ color: "crimson", marginTop: 6 }} role="alert">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="register-student" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h2>Register Student</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={inputs.full_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., John Doe"
          />
          <FieldError name="full_name" />
        </div>

        {/* NIC */}
        <div>
          <label htmlFor="nic">NIC</label>
          <input
            ref={nicRef}
            id="nic"
            name="nic"
            type="text"
            value={inputs.nic}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="12 digits OR 9 digits + V"
          />
          <FieldError name="nic" />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            type="tel"
            value={inputs.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            inputMode="numeric"
            placeholder="0XXXXXXXXX or 9 digits"
          />
          <FieldError name="phone" />
        </div>

        {/* Birth Year */}
        <div>
          <label htmlFor="birthyear">Birth Year</label>
          <input
            id="birthyear"
            name="birthyear"
            type="number"
            value={inputs.birthyear}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 2002"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={inputs.gender}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={inputs.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Street, City"
            rows={3}
          />
          <FieldError name="address" />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
          />
          <FieldError name="email" />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={inputs.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Strong password"
          />
          <small style={{ display: "block", opacity: 0.7, marginTop: 4 }}>
            Min 6 chars incl. 1 uppercase, 1 lowercase, 1 number, 1 special
          </small>
          <FieldError name="password" />
        </div>

        {submitError && (
          <p style={{ color: "crimson", marginTop: 8 }} role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterStudent;

// src/pages/Auth/RegisterStudent.jsx
import React, { useRef, useState, useEffect } from "react";
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

  // Track which fields the user has interacted with
  const [touched, setTouched] = useState({});
  // Store all field errors (keyed by field name)
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Refs for focusing server-side dup errors
  const emailRef = useRef(null);
  const nicRef = useRef(null);
  const phoneRef = useRef(null);

  const API_BASE = "http://localhost:5000";

  // -------- Validators (single-field) --------
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
      const val = String(v ?? "").trim();
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
    gender: (v) => {
      // Optional in earlier code, but if you want required, swap the next line:
      // if (!String(v).trim()) return "Gender is required";
      return "";
    },
    address: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Address is required";
      if (val.length < 5) return "Address is too short";
      return /^[A-Za-z0-9\s,.\-/#]+$/.test(val)
        ? ""
        : "Address contains invalid characters";
    },
    email: (v) => {
      const val = String(v ?? "").trim();
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

  // Validate a single field
  const validateField = (name, value) => {
    const fn = validators[name];
    if (!fn) return "";
    return fn(value);
  };

  // Validate all fields, return an errors map
  const validateAll = (vals) => {
    const nextErrors = {};
    for (const name of fieldOrder) {
      const msg = validateField(name, vals[name] ?? "");
      if (msg) nextErrors[name] = msg;
    }
    return nextErrors;
  };

  // --- Real-time validation: validate on change for touched fields ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextVal = name === "nic" ? value.toUpperCase() : value;

    setInputs((prev) => {
      const merged = { ...prev, [name]: nextVal };
      return merged;
    });

    // Consider the field 'touched' once user interacts
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

    // Live-validate this field once touched
    setErrors((prev) => {
      const msg = validateField(name, nextVal);
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const msg = validateField(name, inputs[name] ?? "");
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Validate everything
    const nextErrors = validateAll(inputs);
    setErrors(nextErrors);
    // Mark everything touched so all errors display
    const allTouched = Object.fromEntries(fieldOrder.map((f) => [f, true]));
    setTouched(allTouched);

    if (Object.keys(nextErrors).length > 0) {
      // focus first invalid
      for (const name of fieldOrder) {
        if (nextErrors[name]) {
          const el = document.getElementById(name);
          el?.focus?.();
          break;
        }
      }
      return;
    }

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

  // Field error block with stable id for aria-describedby
  const FieldError = ({ name }) =>
    touched[name] && errors[name] ? (
      <div
        id={`${name}-error`}
        className="field-error"
        role="alert"
        aria-live="assertive"
      >
        {errors[name]}
      </div>
    ) : null;

  // Helper to wire a11y attributes/valid-state
  const a11y = (name) => ({
    "aria-invalid": !!(touched[name] && errors[name]),
    "aria-describedby": touched[name] && errors[name] ? `${name}-error` : undefined,
    "data-valid": touched[name] ? (!errors[name] ? "true" : "false") : undefined,
  });

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
            {...a11y("full_name")}
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
            {...a11y("nic")}
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
            {...a11y("phone")}
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
            {...a11y("birthyear")}
          />
          <FieldError name="birthyear" />
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
            {...a11y("gender")}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
          <FieldError name="gender" />
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
            {...a11y("address")}
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
            {...a11y("email")}
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
            {...a11y("password")}
          />
          <small className="help-text">
            Min 6 chars incl. 1 uppercase, 1 lowercase, 1 number, 1 special
          </small>
          <FieldError name="password" />
        </div>

        {submitError && (
          <div className="submit-error" role="alert" aria-live="assertive">
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterStudent;

// src/pages/Auth/RegisterStudent.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/register-student.css";

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
    confirm_password: "", // confirm field
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailRef = useRef(null);
  const nicRef = useRef(null);
  const phoneRef = useRef(null);

  const EMAIL_RE =
    /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$/;

  const API_BASE = "http://localhost:5000";

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
    email: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Email is required";
      // TLD must be letters only (2–24 chars). Allows subdomains (e.g., name@dept.uni.lk)
      return EMAIL_RE.test(val)
        ? ""
        : "Enter a valid email address (letters only after the final dot)";
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
    gender: () => "",
    address: (v) => {
      const val = String(v ?? "").trim();
      if (!val) return "Address is required";
      if (val.length < 5) return "Address is too short";
      return /^[A-Za-z0-9\s,.\-/#]+$/.test(val)
        ? ""
        : "Address contains invalid characters";
    },
    password: (v) => {
      if (!v) return "Password is required";
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v)
        ? ""
        : "Min 6 characters including 1 uppercase, 1 lowercase, 1 number, 1 special";
    },
    confirm_password: (v, all) => {
      if (!v) return "Please confirm your password";
      return v === all.password ? "" : "Passwords do not match";
    },
  };

  const fieldOrder = [
    "full_name",
    "nic",
    "phone",
    "email",
    "birthyear",
    "gender",
    "address",
    "password",
    "confirm_password",
  ];

  const validateField = (name, value, all = inputs) => {
    const fn = validators[name];
    if (!fn) return "";
    return fn(value, all);
  };

  const validateAll = (vals) => {
    const nextErrors = {};
    for (const name of fieldOrder) {
      const msg = validateField(name, vals[name] ?? "", vals);
      if (msg) nextErrors[name] = msg;
    }
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextVal = name === "nic" ? value.toUpperCase() : value;

    setInputs((prev) => {
      const merged = { ...prev, [name]: nextVal };
      return merged;
    });

    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

    setErrors((prev) => {
      const all = { ...inputs, [name]: nextVal };
      const next = { ...prev };

      const msg = validateField(name, nextVal, all);
      if (msg) next[name] = msg;
      else delete next[name];

      if (name === "password" && touched.confirm_password) {
        const cmsg = validateField(
          "confirm_password",
          all.confirm_password,
          all
        );
        if (cmsg) next.confirm_password = cmsg;
        else delete next.confirm_password;
      }

      return next;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const msg = validateField(name, inputs[name] ?? "", inputs);
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const nextErrors = validateAll(inputs);
    setErrors(nextErrors);
    const allTouched = Object.fromEntries(fieldOrder.map((f) => [f, true]));
    setTouched(allTouched);

    if (Object.keys(nextErrors).length > 0) {
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
        full_name: inputs.full_name.trim(),
        nic: inputs.nic.trim().toUpperCase(),
        phone: inputs.phone.trim(),
        birthyear: Number(inputs.birthyear),
        gender: inputs.gender,
        address: inputs.address.trim(),
        email: inputs.email.trim().toLowerCase(),
        password: inputs.password,
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

      const otpRes = await fetch(`${API_BASE}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email }),
      });
      const otpData = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) {
        throw new Error(
          otpData.message || `Failed to send OTP (${otpRes.status})`
        );
      }

      navigate("/otp-request", {
        state: { email: payload.email },
        replace: true,
      });
    } catch (err) {
      setSubmitError(err.message || "Registration or OTP sending failed");
    } finally {
      setSubmitting(false);
    }
  };

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

  const a11y = (name) => ({
    "aria-invalid": !!(touched[name] && errors[name]),
    "aria-describedby":
      touched[name] && errors[name] ? `${name}-error` : undefined,
    "data-valid": touched[name]
      ? !errors[name]
        ? "true"
        : "false"
      : undefined,
  });

  return (
    <div className="register-container">
      {/* Left: form card (scrolls) */}
      <div className="register-left">
        <h2>Create your student account</h2>
        <p className="subtitle">Join RiyaGuru.lk and start learning with us.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={inputs.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ex: SENITH SANDEEPA"
              {...a11y("full_name")}
            />
            <FieldError name="full_name" />
          </div>

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
              placeholder="ex: 2000123456 or 991234567V"
              {...a11y("nic")}
            />
            <FieldError name="nic" />
          </div>

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
              placeholder="ex: 0771234567 or 771234567"
              {...a11y("phone")}
            />
            <FieldError name="phone" />
          </div>

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
              placeholder="ex: senith******@example.com"
              {...a11y("email")}
            />
            <FieldError name="email" />
          </div>

          <div>
            <label htmlFor="birthyear">Birth Year</label>
            <input
              id="birthyear"
              name="birthyear"
              type="number"
              value={inputs.birthyear}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ex: 2002"
              min="1900"
              max={new Date().getFullYear()}
              {...a11y("birthyear")}
            />
            <FieldError name="birthyear" />
          </div>

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

          <div>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={inputs.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Street, City, Country or Region"
              rows={3}
              {...a11y("address")}
            />
            <FieldError name="address" />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={inputs.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ex: Student@1234"
              {...a11y("password")}
            />
            {/*<small className="help-text">
              Min 6 chars incl. 1 uppercase, 1 lowercase, 1 number, 1 special
            </small>*/}
            <FieldError name="password" />
          </div>

          <div>
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={inputs.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter password"
              {...a11y("confirm_password")}
            />
            <FieldError name="confirm_password" />
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

        <p className="have-account">
          Already have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Right: fixed hero image (does NOT scroll) */}
      <div className="register-right" />
    </div>
  );
}

export default RegisterStudent;

import React, { useState } from "react";
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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Clean/coerce a few fields before sending
      const payload = {
        ...inputs,
        birthyear: Number(inputs.birthyear),
        nic: inputs.nic.trim(),
        email: inputs.email.trim().toLowerCase(),
        phone: inputs.phone.trim(),
        address: inputs.address.trim(),
        full_name: inputs.full_name.trim(),
      };

      // 1) Register the student
      const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      // 2) Send OTP to the same email
      const otpRes = await fetch(`${API_BASE}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email }),
      });

      const otpData = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) {
        throw new Error(otpData.message || `Failed to send OTP (${otpRes.status})`);
      }

      // 3) Navigate to OTP page with the email in state
      navigate("/otp-request", {
        state: { email: payload.email },
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Registration or OTP sending failed");
    } finally {
      setSubmitting(false);
    }
  };

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
            placeholder="e.g., John Doe"
            required
          />
        </div>

        {/* NIC */}
        <div>
          <label htmlFor="nic">NIC</label>
          <input
            id="nic"
            name="nic"
            type="text"
            value={inputs.nic}
            onChange={handleChange}
            placeholder="Your NIC"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={inputs.phone}
            onChange={handleChange}
            placeholder="07XXXXXXXX"
            pattern="^[0-9+\\-\\s]{9,15}$"
            required
          />
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
            placeholder="e.g., 2002"
            min="1900"
            max={new Date().getFullYear()}
            required
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
            required
          >
            <option value="" disabled>
              Select gender
            </option>
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
            placeholder="Street, City"
            rows={3}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
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
            placeholder="Min 6 characters"
            minLength={6}
            required
          />
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 8 }} role="alert">
            {error}
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

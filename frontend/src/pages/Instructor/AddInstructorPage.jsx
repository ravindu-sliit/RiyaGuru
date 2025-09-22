// src/pages/Instructor/AddInstructorPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

const initial = {
  name: "",
  email: "",
  phone: "",
  address: "",
  licenseNumber: "",
  experienceYears: 0,
  specialization: "All",
  password: "",
  availability: [],
};

export default function AddInstructorPage() {
  const nav = useNavigate();
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Availability input
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "experienceYears" ? Number(value) : value,
    }));
  };

  const onImage = (e) => {
    const f = e.target.files?.[0];
    setImage(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const addAvailability = () => {
    if (!date || !time) return;
    const d = date.toISOString().split("T")[0];
    const newSlot = { date: d, timeSlots: [time] };

    setForm((f) => {
      const exists = f.availability.find((a) => a.date === d);
      if (exists) {
        if (!exists.timeSlots.includes(time)) {
          exists.timeSlots = [...exists.timeSlots, time];
        }
        return { ...f, availability: [...f.availability] };
      }
      return { ...f, availability: [...f.availability, newSlot] };
    });
    setTime("");
  };

  const removeSlot = (d, t) => {
    setForm((f) => {
      const updated = f.availability
        .map((a) =>
          a.date === d
            ? { ...a, timeSlots: a.timeSlots.filter((ts) => ts !== t) }
            : a
        )
        .filter((a) => a.timeSlots.length > 0);
      return { ...f, availability: updated };
    });
  };

  const validate = () => {
    if (!form.name || !form.email || !form.licenseNumber || !form.password)
      return "Name, Email, License Number and Password are required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "availability") {
          fd.append("availability", JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      if (image) fd.append("image", image);

      await InstructorAPI.create(fd);
      nav("/instructors/list");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Add Instructor</h1>
      </header>

      <form className="form-card" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}

        <div className="grid-2">
          <div>
            <label>Name</label>
            <input className="input" name="name" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label>Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
          </div>
          <div>
            <label>Phone</label>
            <input className="input" name="phone" value={form.phone} onChange={onChange} />
          </div>
          <div>
            <label>Address</label>
            <input className="input" name="address" value={form.address} onChange={onChange} />
          </div>
          <div>
            <label>License Number</label>
            <input className="input" name="licenseNumber" value={form.licenseNumber} onChange={onChange} required />
          </div>
          <div>
            <label>Experience (years)</label>
            <input className="input" type="number" min="0" name="experienceYears" value={form.experienceYears} onChange={onChange} />
          </div>
          <div>
            <label>Specialization</label>
            <select className="select" name="specialization" value={form.specialization} onChange={onChange}>
              <option value="All">All</option>
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Threewheeler">Threewheeler</option>
              <option value="HeavyVehicle">HeavyVehicle</option>
            </select>
          </div>
          <div>
            <label>Password</label>
            <input className="input" name="password" type="password" value={form.password} onChange={onChange} required />
          </div>
          <div>
            <label>Profile Image</label>
            <input className="input" type="file" accept="image/*" onChange={onImage} />
            {preview && <img className="preview" src={preview} alt="preview" />}
          </div>
        </div>

        {/* Availability */}
        <div className="availability-section">
          <h3>Set Availability</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <DatePicker selected={date} onChange={(d) => setDate(d)} />
            <TimePicker onChange={setTime} value={time} disableClock={true} clearIcon={null} />
            <button type="button" className="btn btn-secondary" onClick={addAvailability}>Add Slot</button>
          </div>

          <div className="slots-list">
            {form.availability.map((a) => (
              <div key={a.date}>
                <strong>{a.date}</strong>
                <ul>
                  {a.timeSlots.map((t) => (
                    <li key={t}>
                      {t} <button type="button" onClick={() => removeSlot(a.date, t)}>❌</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

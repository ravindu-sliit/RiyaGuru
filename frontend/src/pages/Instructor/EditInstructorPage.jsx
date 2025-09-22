// src/pages/Instructor/EditInstructorPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";
import "../../styles/instructor.css";

export default function EditInstructorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await InstructorAPI.getById(id);
        setForm(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, [id]);

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

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let payload;
      if (image) {
        const fd = new FormData();
        [
          "name",
          "email",
          "phone",
          "address",
          "licenseNumber",
          "experienceYears",
          "specialization",
          "status",
        ].forEach((k) => fd.append(k, form[k] ?? ""));
        fd.append("image", image);
        payload = fd;
      } else {
        payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          licenseNumber: form.licenseNumber,
          experienceYears: form.experienceYears,
          specialization: form.specialization,
          status: form.status,
        };
      }
      await InstructorAPI.update(id, payload);
      nav(`/instructors/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <div className="inst-container">
        <div className="skeleton-lg" />
      </div>
    );

  // ✅ Build safe image URL for existing instructor
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const currentImageUrl = preview
    ? preview
    : form.image
    ? form.image.startsWith("http")
      ? form.image
      : `${API_URL}${form.image}`
    : "/no-avatar.png";

  return (
    <div className="inst-container">
      <header className="inst-header">
        <h1>Edit Instructor</h1>
      </header>

      <form className="form-card" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}

        <div className="grid-2">
          <div>
            <label>Name</label>
            <input
              className="input"
              name="name"
              value={form.name || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              className="input"
              name="email"
              type="email"
              value={form.email || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              className="input"
              name="phone"
              value={form.phone || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Address</label>
            <input
              className="input"
              name="address"
              value={form.address || ""}
              onChange={onChange}
            />
          </div>

          <div>
            <label>License Number</label>
            <input
              className="input"
              name="licenseNumber"
              value={form.licenseNumber || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Experience (years)</label>
            <input
              className="input"
              type="number"
              min="0"
              name="experienceYears"
              value={form.experienceYears ?? 0}
              onChange={onChange}
            />
          </div>

          <div>
            <label>Specialization</label>
            <select
              className="select"
              name="specialization"
              value={form.specialization || "All"}
              onChange={onChange}
            >
              <option value="All">All</option>
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Threewheeler">Threewheeler</option>
              <option value="HeavyVehicle">HeavyVehicle</option>
            </select>
          </div>

          <div>
            <label>Status</label>
            <select
              className="select"
              name="status"
              value={form.status || "Not-Active"}
              onChange={onChange}
            >
              <option value="Active">Active</option>
              <option value="Not-Active">Not-Active</option>
            </select>
          </div>

          <div>
            <label>Replace Image</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={onImage}
            />
            {currentImageUrl && (
              <img
                className="preview"
                alt="preview"
                src={currentImageUrl}
                onError={(e) => {
                  e.currentTarget.src = "/no-avatar.png";
                }}
              />
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

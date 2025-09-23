import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import vehicleAPI from "../../api/vehicleApi";
import { ArrowLeft, Save, Upload, X, Car } from "lucide-react";
import { toast } from "react-toastify";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    regNo: "",
    model: "",
    brand: "",
    type: "",
    year: new Date().getFullYear(),
    fuelType: "",
    mileage: 0,
    status: "Not-Active",
    lastServiceDate: "",
    nextServiceDue: "",
    assignedInstructor: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.regNo.trim())
      newErrors.regNo = "Registration number is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.type) newErrors.type = "Vehicle type is required";
    if (!formData.fuelType) newErrors.fuelType = "Fuel type is required";
    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }
    if (formData.mileage < 0) newErrors.mileage = "Mileage cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") fd.append(key, value);
      });

      await vehicleAPI.create(fd);
      toast.success("Vehicle added successfully!");
      navigate("/vehicles");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add vehicle");
      console.error("Error creating vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="flex justify-between items-center bg-white px-6 py-3 border-b shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <Car className="text-orange-500 w-6 h-6" />
          <span>DriveSchool</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <span className="hover:text-orange-500 cursor-pointer">Dashboard</span>
          <span className="text-orange-500 font-semibold cursor-pointer">
            All Vehicles
          </span>
          <span className="hover:text-orange-500 cursor-pointer">Add Vehicle</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate("/vehicles")}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-600 hover:border-orange-500 hover:text-orange-500 transition mb-4"
        >
          <ArrowLeft size={16} /> Back to Vehicles
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
          <p className="text-gray-500 text-sm">
            Add a new vehicle to your driving school fleet
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow border overflow-hidden grid md:grid-cols-3"
        >
          {/* Main Form */}
          <div className="p-6 md:col-span-2 border-r">
            {/* Basic Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    placeholder="ABC-1234"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.regNo ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  />
                  {errors.regNo && (
                    <p className="text-xs text-red-500 mt-1">{errors.regNo}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Honda, Toyota, etc."
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.brand ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  />
                  {errors.brand && (
                    <p className="text-xs text-red-500 mt-1">{errors.brand}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Civic, Aqua, etc."
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.model ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500 mt-1">{errors.model}</p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.year ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  />
                  {errors.year && (
                    <p className="text-xs text-red-500 mt-1">{errors.year}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vehicle Specifications
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="ThreeWheeler">Three Wheeler</option>
                    <option value="HeavyVehicle">Heavy Vehicle</option>
                  </select>
                  {errors.type && (
                    <p className="text-xs text-red-500 mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.fuelType ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                  {errors.fuelType && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fuelType}
                    </p>
                  )}
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    min="0"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.mileage ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-400`}
                  />
                  {errors.mileage && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.mileage}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Not-Active">Not Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Service Due
                  </label>
                  <input
                    type="date"
                    name="nextServiceDue"
                    value={formData.nextServiceDue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="p-6 bg-gray-50 flex flex-col">
            {/* Image Upload */}
            <div className="mb-6 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Vehicle Image
              </h3>
              <div>
                {imagePreview ? (
                  <div className="relative border rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Vehicle preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("image").click()}
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50"
                  >
                    <Upload className="mx-auto text-gray-400 w-10 h-10 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="text-orange-500 font-medium">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Add Vehicle
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/vehicles")}
                disabled={loading}
                className="w-full py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;

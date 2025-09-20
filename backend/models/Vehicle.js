import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    regNo: { type: String, required: true, unique: true },   // Vehicle registration number
    model: { type: String, required: true },                 // e.g. Civic
    brand: { type: String, required: true },                 // e.g. Honda
    type: { 
      type: String, 
      enum: ["Car", "Van", "ThreeWheeler","Lorry","Bus"], 
      required: true 
    },
    year: { type: Number, required: true },
    fuelType: { 
      type: String, 
      enum: ["Petrol", "Diesel", "Hybrid", "Electric"], 
      required: true 
    },
    mileage: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Not-Active", "Maintenance"], 
      default: "Not-Active" 
    },
    lastServiceDate: { type: Date },
    nextServiceDue: { type: Date },

    // Vehicle image (uploaded from device)
    image: { type: String },  // path to uploaded photo

    // 🔗 Assign vehicle to an instructor
    assignedInstructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;

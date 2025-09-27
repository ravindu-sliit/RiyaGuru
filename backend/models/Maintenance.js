import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",   // ✅ Reference to Vehicle model
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    serviceType: {
      type: String,
      maxlength: 100,
    },
    cost: {
      type: mongoose.Schema.Types.Decimal128, // DECIMAL(10,2)
      default: 0.0,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔄 Convert Decimal128 -> Number in JSON responses
maintenanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.cost) {
      ret.cost = parseFloat(ret.cost.toString());
    }
    return ret;
  },
});

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;

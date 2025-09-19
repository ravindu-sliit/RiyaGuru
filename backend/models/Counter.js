import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "instructorId"
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;

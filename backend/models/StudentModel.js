import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  nic: {
    type: String, 
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  birthyear: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;

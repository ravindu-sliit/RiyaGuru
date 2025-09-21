import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({

  studentId: {
    type: String,
    unique: true
  },

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
   email: { // new field
    type: String,
    required: true,
    unique: true
  },
  password: { // new field
    type: String,
    
  },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;

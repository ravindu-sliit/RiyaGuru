import Student from "../models/StudentModel.js";

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }
    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching students" });
  }
};

// Add a new student
export const addStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address } = req.body;

  try {
    const student = new Student({ full_name, nic, phone, birthyear, gender, address });
    await student.save();
    res.status(201).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding student" });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching student" });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address } = req.body;

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { full_name, nic, phone, birthyear, gender, address },
      { new: true } // return updated document
    );

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting student" });
  }
};

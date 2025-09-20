import StudentCourse from "../models/StudentCourse.js";

// Add student course manually (if needed)
export const addStudentCourse = async (req, res) => {
  try {
    const { student_id, course_id, status } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ message: "student_id and course_id are required" });
    }

    // Create new course (student_course_id auto-generated)
    const newCourse = await StudentCourse.create({
      student_id,
      course_id,
      status: status || "Active"

      
    });

    await newCourse.save();

    res.status(201).json({ 
      message: "Student course added successfully", 
      course: newCourse 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding student course" });
  }
};

// Get all student courses
export const getAllStudentCourses = async (req, res) => {
  try {
    const courses = await StudentCourse.find();
    res.status(200).json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
};

// Get courses by student_id
export const getCoursesByStudentId = async (req, res) => {
  try {
    const courses = await StudentCourse.find({ student_id: req.params.student_id });
    if (!courses.length) return res.status(404).json({ message: "No courses found for this student" });
    res.status(200).json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching student courses" });
  }
};

// Update student course
export const updateStudentCourse = async (req, res) => {
  try {
    const { course_id, status } = req.body;

    const course = await StudentCourse.findOneAndUpdate(
      { student_id: req.params.student_id, course_id },
      { status },
      { new: true }
    );

    if (!course) return res.status(404).json({ message: "Course not found for this student" });

    res.status(200).json({ message: "Student course updated successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating student course" });
  }
};

// Delete student course
export const deleteStudentCourse = async (req, res) => {
  try {
    const course = await StudentCourse.findOneAndDelete({
      student_id: req.params.student_id,
      course_id: req.params.course_id
    });

    if (!course) return res.status(404).json({ message: "Course not found for this student" });

    res.status(200).json({ message: "Student course deleted successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting student course" });
  }
};

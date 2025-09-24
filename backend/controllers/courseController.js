import Course from "../models/Course.js";

// Add a new course
export const addCourse = async (req, res) => {
  try {
    const { name, description, price, duration, totalLessons } = req.body;

    const newCourse = new Course({
      name,
      description,
      price,
      duration,
      totalLessons
    });

    await newCourse.save();
    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const result = await Course.find();
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
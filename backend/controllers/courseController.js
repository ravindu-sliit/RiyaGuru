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

// Get single course by id or name (case-insensitive)
export const getCourseByKey = async (req, res) => {
  try {
    const key = String(req.params.key || "").trim();
    if (!key) return res.status(400).json({ message: "Course key is required" });

    let course = null;
    // Try by ObjectId first
    if (key.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(key);
    }
    // If not found, try by exact name, then case-insensitive name
    if (!course) {
      course = await Course.findOne({ name: key });
    }
    if (!course) {
      course = await Course.findOne({ name: { $regex: `^${key}$`, $options: "i" } });
    }
    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching course", error: error.message });
  }
};
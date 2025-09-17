import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Start server only after MongoDB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running 🚀 on port ${PORT} and connected to MongoDB`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

  // checking sankalpa
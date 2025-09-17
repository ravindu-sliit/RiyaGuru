import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect("mongodb+srv://RiyaGuru_lk:riyaguru_123@cluster0.nozx2ta.mongodb.net/RiyaGuruDB")
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running 🚀 connected to MongoDB")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));


app.listen(process.env.PORT || 5000, () => 
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);


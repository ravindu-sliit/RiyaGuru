import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(process.env.PORT || 5000, () =>
//       console.log("Server running")
//     );
//   })
//   .catch((err) => console.error(err));

app.listen(process.env.PORT || 5000, () => 
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);


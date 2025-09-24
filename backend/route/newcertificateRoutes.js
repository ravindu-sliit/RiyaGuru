// routes/certificateRoutes.js
import express from "express";
import { studentGenerateCertificate } from "../controllers/newreportController.js";

const router = express.Router();

// Student self-service
router.post(
  "/student/:studentId/:courseName",
  studentGenerateCertificate
);

export default router;

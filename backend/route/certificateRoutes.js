// routes/certificateRoutes.js
import express from "express";
import {
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
} from "../controllers/certificateController.js";

const router = express.Router();

// ✅ Issue certificate for a student+course
// POST /api/certificates/issue/S001/Car
router.post("/issue/:studentId/:courseName", issueCertificate);

// ✅ Public verify endpoint (QR code links here)
// GET /api/certificates/verify?id=C001&hash=<sha256>
router.get("/verify", verifyCertificate);

// ✅ Admin revoke
// POST /api/certificates/revoke/C001
router.post("/revoke/:certificateId", revokeCertificate);

export default router;

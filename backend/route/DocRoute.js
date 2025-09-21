import express from "express";
import {
  addDocument,
  getDocumentsByStudent,
  getDocumentByDocId,
  deleteDocument,
  deleteDocumentByType,
} from "../controllers/DocController.js";
import docUpload from "../middleware/docUpload.js";

const router = express.Router();

/**
 * POST /docs
 * Form-Data:
 *  - studentId: "S001"
 *  - nicFront: <file> (optional; if provided nicBack also required)
 *  - nicBack:  <file> (optional; if provided nicFront also required)
 *  - dlFront:  <file> (optional; if provided dlBack also required; not allowed for Light)
 *  - dlBack:   <file> (optional; if provided dlFront also required; not allowed for Light)
 *
 * You can upload NIC and/or Driver_License in the same request.
 */
router.post("/", docUpload, addDocument);

// GET all docs for a student
router.get("/student/:studentId", getDocumentsByStudent);

// GET single doc by docId
router.get("/:docId", getDocumentByDocId);

// DELETE doc by docId
router.delete("/:docId", deleteDocument); 

// DELETE doc by studentId + type (NIC or Driver_License)
router.delete("/student/:studentId/type/:docType", deleteDocumentByType);   //http://localhost:5000/api/docs/student/S017/type/NIC

export default router;




import Doc from "../models/DocModel.js";
import Student from "../models/StudentModel.js";
import Preference from "../models/PreferenceModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads/studentDocs directory (relative to backend/)
const uploadsDir = path.join(__dirname, "..", "uploads", "studentDocs");

// small helper to delete a filename if it exists
function unlinkIfExists(filename) {
  try {
    if (!filename) return;
    const p = path.join(uploadsDir, filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    // don't throw from cleanup
    console.warn("Cleanup failed for:", filename, e?.message);
  }
}

// helper to clean all 4 possible files from this request
function cleanupAll(req) {
  unlinkIfExists(req?.files?.nicFront?.[0]?.filename);
  unlinkIfExists(req?.files?.nicBack?.[0]?.filename);
  unlinkIfExists(req?.files?.dlFront?.[0]?.filename);
  unlinkIfExists(req?.files?.dlBack?.[0]?.filename);
}

// CREATE (supports single or both docs in one request)
export const addDocument = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      cleanupAll(req);
      return res.status(400).json({ message: "studentId is required" });
    }

    // Student must exist
    const student = await Student.findOne({ studentId });
    if (!student) {
      cleanupAll(req);
      return res.status(404).json({ message: "Student not found" });
    }

    // Get preference to enforce Light/Heavy rule
    const pref = await Preference.findOne({ studentId });
    if (!pref) {
      cleanupAll(req);
      return res.status(400).json({ message: "Student preference not found. Set preference first." });
    }

    // Gather files from Multer
    const nicFront = req.files?.nicFront?.[0];
    const nicBack  = req.files?.nicBack?.[0];
    const dlFront  = req.files?.dlFront?.[0];
    const dlBack   = req.files?.dlBack?.[0];

    const wantsNIC = !!(nicFront || nicBack);
    const wantsDL  = !!(dlFront || dlBack);

    if (!wantsNIC && !wantsDL) {
      return res.status(400).json({
        message: "Provide files for NIC (nicFront & nicBack) and/or Driver_License (dlFront & dlBack)",
      });
    }

    // ❗ If Light and request contains any DL files → reject and clean up EVERYTHING uploaded in this request
    if (pref.vehicleCategory === "Light" && wantsDL) {
      // clean both DL and NIC files from this request to avoid leftovers
      cleanupAll(req);
      return res.status(400).json({
        message: "Only NIC is allowed for Light vehicle category",
      });
    }

    // Validate both sides exist for each requested doc; if invalid, clean up all files from this request
    if (wantsNIC && (!nicFront || !nicBack)) {
      cleanupAll(req);
      return res.status(400).json({ message: "Both nicFront and nicBack image files are required for NIC" });
    }
    if (wantsDL && (!dlFront || !dlBack)) {
      cleanupAll(req);
      return res.status(400).json({ message: "Both dlFront and dlBack image files are required for Driver_License" });
    }

    // ✅ Pre-check duplicates before creating anything; if duplicate, clean up only the just-uploaded files for THAT type
    const errors = [];
    let skipNIC = false;
    let skipDL = false;

    if (wantsNIC) {
      const existingNIC = await Doc.findOne({ studentId, docType: "NIC" });
      if (existingNIC) {
        // duplicate NIC: remove newly uploaded NIC files
        unlinkIfExists(nicFront?.filename);
        unlinkIfExists(nicBack?.filename);
        skipNIC = true;
        errors.push("NIC already exists for this student");
      }
    }

    if (wantsDL) {
      const existingDL = await Doc.findOne({ studentId, docType: "Driver_License" });
      if (existingDL) {
        unlinkIfExists(dlFront?.filename);
        unlinkIfExists(dlBack?.filename);
        skipDL = true;
        errors.push("Driver_License already exists for this student");
      }
    }

    // If both requested types were duplicates, nothing to create
    if ((wantsNIC && skipNIC) && (wantsDL && skipDL)) {
      return res.status(409).json({ message: errors.join("; ") });
    }

    const created = [];

    // Create NIC if requested and not duplicate
    if (wantsNIC && !skipNIC) {
      const nicDoc = await Doc.create({
        studentId,
        docType: "NIC",
        frontImagePath: nicFront.filename,
        backImagePath: nicBack.filename,
      });
      created.push({
        ...nicDoc.toObject(),
        frontUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${nicFront.filename}`,
        backUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${nicBack.filename}`,
      });
    }

    // Create DL if requested and not duplicate (Heavy only, already enforced)
    if (wantsDL && !skipDL) {
      const dlDoc = await Doc.create({
        studentId,
        docType: "Driver_License",
        frontImagePath: dlFront.filename,
        backImagePath: dlBack.filename,
      });
      created.push({
        ...dlDoc.toObject(),
        frontUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${dlFront.filename}`,
        backUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${dlBack.filename}`,
      });
    }

    // If at least one was created, return 201 with optional duplicate warnings
    if (created.length > 0) {
      return res.status(201).json({
        message: errors.length ? "Some documents uploaded; some failed" : "Document(s) uploaded successfully",
        created,
        errors: errors.length ? errors : undefined,
      });
    }

    // Otherwise only duplicates were requested
    return res.status(409).json({ message: errors.join("; ") });
  } catch (err) {
    // generic error → clean up everything uploaded in this request
    cleanupAll(req);
    console.error(err);
    return res.status(500).json({ message: "Server error while uploading document(s)" });
  }
};

// LIST by student
export const getDocumentsByStudent = async (req, res) => {
  try {
    const docs = await Doc.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });

    const documents = docs.map((d) => ({
      ...d.toObject(),
      frontUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${d.frontImagePath}`,
      backUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${d.backImagePath}`,
    }));

    res.status(200).json({ documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching documents" });
  }
};

// GET single (by docId)
export const getDocumentByDocId = async (req, res) => {
  try {
    const doc = await Doc.findOne({ docId: req.params.docId });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    res.status(200).json({
      doc: {
        ...doc.toObject(),
        frontUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${doc.frontImagePath}`,
        backUrl: `${req.protocol}://${req.get("host")}/uploads/studentDocs/${doc.backImagePath}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching document" });
  }
};

// DELETE (by docId)
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Doc.findOneAndDelete({ docId: req.params.docId });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const files = [doc.frontImagePath, doc.backImagePath];
    let deleted = 0;

    files.forEach((filename) => {
      try {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch (e) {
        console.warn("Failed to delete file:", filename, e?.message);
      }
    });

    res.status(200).json({
      message: `Document deleted successfully. Files removed: ${deleted}/${files.length}`,
      doc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting document" });
  }
};

// DELETE by (studentId, docType) — remove NIC or License separately
export const deleteDocumentByType = async (req, res) => {
  try {
    const { studentId, docType } = req.params;
    if (!["NIC", "Driver_License"].includes(docType)) {
      return res.status(400).json({ message: "docType must be NIC or Driver_License" });
    }

    const doc = await Doc.findOneAndDelete({ studentId, docType });
    if (!doc) return res.status(404).json({ message: "Document not found for this student/type" });

    const files = [doc.frontImagePath, doc.backImagePath];
    let deleted = 0;

    files.forEach((filename) => {
      try {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch (e) {
        console.warn("Failed to delete file:", filename, e?.message);
      }
    });

    res.status(200).json({
      message: `Document (type=${docType}) deleted. Files removed: ${deleted}/${files.length}`,
      doc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting document by type" });
  }
};

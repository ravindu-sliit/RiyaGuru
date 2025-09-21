import PDFDocument from "pdfkit";
import Maintenance from "../models/Maintenance.js";

// Generate Maintenance PDF Report
export const generateMaintenancePDF = async (req, res) => {
  try {
    const maintenanceRecords = await Maintenance.find().populate("vehicleId", "regNumber model");

    if (!maintenanceRecords || maintenanceRecords.length === 0) {
      return res.status(404).json({ success: false, message: "No maintenance records found" });
    }

    // Create a PDF Document
    const doc = new PDFDocument();
    const filename = `Maintenance_Report_${Date.now()}.pdf`;

    // Set headers
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF stream
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("📄 Maintenance Report", { align: "center" });
    doc.moveDown();

    // Loop through maintenance records
    maintenanceRecords.forEach((record, index) => {
      doc.fontSize(12).text(`Record #${index + 1}`, { underline: true });
      doc.text(`Vehicle: ${record.vehicleId?.regNumber || "N/A"} - ${record.vehicleId?.model || ""}`);
      doc.text(`Service Date: ${new Date(record.serviceDate).toDateString()}`);
      doc.text(`Service Type: ${record.serviceType}`);
      doc.text(`Cost: ${record.cost}`);
      doc.text(`Description: ${record.description}`);
      doc.moveDown();
    });

    // End PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

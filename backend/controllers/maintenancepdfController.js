// controllers/maintenancepdfController.js
import Maintenance from "../models/Maintenance.js";
import PDFDocument from "pdfkit";

// Generate PDF Maintenance Report
export const generateMaintenancePDF = async (req, res) => {
  try {
    const records = await Maintenance.find().populate("vehicleId", "regNo model");

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Disposition", "attachment; filename=maintenance-report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF stream to response
    doc.pipe(res);

    // Title
    doc.fontSize(22).font("Helvetica-Bold").text("RiyaGuru Driving School", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).font("Helvetica").text("Vehicle Maintenance Report", { align: "center" });
    doc.moveDown(1.5);

    // Table headers
    const tableTop = 150;
    const colWidths = { vehicle: 200, date: 120, type: 120, cost: 80 };

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Vehicle", 50, tableTop, { width: colWidths.vehicle });
    doc.text("Service Date", 260, tableTop, { width: colWidths.date });
    doc.text("Type", 380, tableTop, { width: colWidths.type });
    doc.text("Cost (LKR)", 500, tableTop, { width: colWidths.cost, align: "right" });

    doc.moveTo(50, tableTop + 15).lineTo(580, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font("Helvetica").fontSize(11);

    records.forEach((rec) => {
      const vehicle = rec.vehicleId ? `${rec.vehicleId.regNo} (${rec.vehicleId.model})` : "N/A";
      const serviceDate = new Date(rec.serviceDate).toLocaleDateString("en-US");
      const type = rec.serviceType || "N/A";
      const cost = rec.cost ? parseFloat(rec.cost).toFixed(2) : "0.00";

      doc.text(vehicle, 50, y, { width: colWidths.vehicle });
      doc.text(serviceDate, 260, y, { width: colWidths.date });
      doc.text(type, 380, y, { width: colWidths.type });
      doc.text(cost, 500, y, { width: colWidths.cost, align: "right" });

      y += 20;

      // Add new page if too long
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, 750, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to generate PDF" });
  }
};

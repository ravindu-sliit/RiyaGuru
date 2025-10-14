import Maintenance from "../models/Maintenance.js";
import PDFDocument from "pdfkit";

// Generate PDF Maintenance Report
export const generateMaintenancePDF = async (req, res) => {
  try {
    const records = await Maintenance.find().populate("vehicleId", "regNo model");
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
    });

    res.setHeader("Content-Disposition", "attachment; filename=maintenance-report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // ==== Brand Colors ====
    const primaryColor = "#0B1B33";
    const accentColor = "#F47C20";
    const lightGray = "#F5F7FB";
    const darkGray = "#1F2937";

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ===== HEADER =====
    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(26)
      .text("RiyaGuru Driving School", doc.page.margins.left, 70, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor(darkGray)
      .text("Vehicle Maintenance Report", doc.page.margins.left, 105, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fontSize(10)
      .fillColor(darkGray)
      .text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        doc.page.margins.left,
        130,
        { width: contentWidth, align: "center" }
      );

    // ===== SUMMARY BOXES (CENTERED) =====
    const totalCost = records.reduce((sum, rec) => sum + (parseFloat(rec.cost) || 0), 0);
    const totalVehicles = [
      ...new Set(records.map((r) => r.vehicleId?._id?.toString()).filter(Boolean)),
    ].length;

    const boxY = 170;
    const boxWidth = 170;
    const boxHeight = 80;
    const gap = 25;
    const totalBoxWidth = boxWidth * 3 + gap * 2;
    const startX = doc.page.margins.left + (contentWidth - totalBoxWidth) / 2;

    const padX = 20;
    const padTitleY = 18;
    const padNumY = 44;

    const boxes = [
      { title: "TOTAL MAINTENANCE", value: records.length },
      { title: "TOTAL COST (LKR)", value: totalCost.toFixed(2) },
      { title: "VEHICLES", value: totalVehicles },
    ];

    boxes.forEach((box, index) => {
      const x = startX + index * (boxWidth + gap);
      doc
        .roundedRect(x, boxY, boxWidth, boxHeight, 8)
        .fill(lightGray)
        .fillColor(darkGray)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(box.title, x + padX, boxY + padTitleY)
        .fontSize(26)
        .fill(accentColor)
        .text(String(box.value), x + padX, boxY + padNumY);
    });

    // ===== TABLE (CENTERED) =====
    const tableTop = boxY + boxHeight + 60;

    // ⬇️ Widen cost, narrow type (so header text fits)
    const colWidths = {
      regNo: 100,
      model: 110,
      date: 100,
      type: 110,  // was 120
      cost: 110,  // was 100
    };

    const tableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    const tableX = doc.page.margins.left + (contentWidth - tableWidth) / 2;

    // Header background
    doc
      .roundedRect(tableX, tableTop - 15, tableWidth, 30, 6)
      .fill(primaryColor);

    // Header text
    doc.fontSize(10).font("Helvetica-Bold").fillColor("white");
    let textY = tableTop - 5;
    let x = tableX + 15;

    doc.text("REGNO", x, textY, { width: colWidths.regNo - 10 });
    x += colWidths.regNo;
    doc.text("MODEL", x, textY, { width: colWidths.model - 10 });
    x += colWidths.model;
    doc.text("DATE", x, textY, { width: colWidths.date - 10 });
    x += colWidths.date;
    doc.text("TYPE", x, textY, { width: colWidths.type - 10 });
    x += colWidths.type;
    // plenty of room now for full label
    doc.text("COST (LKR)", x, textY, { width: colWidths.cost - 10, align: "right" });

    // ===== ROWS (CENTERED UNDER HEADER) =====
    let y = tableTop + 25;
    let rowIndex = 0;

    for (const record of records) {
      if (y > 720) {
        doc.addPage();
        y = 60;
      }

      const vehicle = record.vehicleId?.regNo || "N/A";
      const model = record.vehicleId?.model || "N/A";
      const serviceDate = record.serviceDate
        ? new Date(record.serviceDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";
      const type = record.serviceType || "N/A";
      const cost = record.cost ? parseFloat(record.cost).toFixed(2) : "0.00";

      const rowColor = rowIndex % 2 === 0 ? "#ffffff" : lightGray;
      doc.roundedRect(tableX, y - 10, tableWidth, 25, 3).fill(rowColor);

      doc.fontSize(9).font("Helvetica").fillColor(darkGray);
      let cellX = tableX + 15;

      doc.text(vehicle, cellX, y, { width: colWidths.regNo - 15 }); cellX += colWidths.regNo;
      doc.text(model,   cellX, y, { width: colWidths.model - 15 }); cellX += colWidths.model;
      doc.text(serviceDate, cellX, y, { width: colWidths.date - 15 }); cellX += colWidths.date;
      doc.text(type,     cellX, y, { width: colWidths.type - 15 }); cellX += colWidths.type;
      doc.text(cost,     cellX, y, { width: colWidths.cost - 15, align: "right" });

      y += 25;
      rowIndex++;
    }

    // ===== FOOTER =====
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor(darkGray)
        .text(`Page ${i + 1} of ${pageCount}`, doc.page.width - 100, doc.page.height - 30);

      doc
        .moveTo(doc.page.margins.left, doc.page.height - 40)
        .lineTo(doc.page.width - doc.page.margins.right, doc.page.height - 40)
        .lineWidth(1)
        .stroke(lightGray);

      doc
        .fontSize(8)
        .fillColor(primaryColor)
        .text(
          "RiyaGuru Driving School - Vehicle Maintenance Report",
          doc.page.margins.left,
          doc.page.height - 30
        );
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
      details: error.message,
    });
  }
};

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateBookingPDF = (booking, student, instructor, vehicle) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join("uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const filePath = path.join(uploadsDir, `booking_${booking.bookingId}.pdf`);
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Booking Confirmation - ${booking.bookingId}`,
          Author: 'RiyaGuru Driving School',
          Subject: 'Driving Lesson Booking Confirmation',
          Creator: 'RiyaGuru.lk'
        }
      });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Define colors and styles
      const primaryColor = '#2c3e50';
      const secondaryColor = '#3498db';
      const accentColor = '#e74c3c';
      const lightGray = '#ecf0f1';

      // Header Section with Company Branding
      drawHeader(doc, primaryColor, secondaryColor);
      
      // Booking Status Badge
      drawStatusBadge(doc, booking.status, accentColor);
      
      // Main Content Sections
      drawBookingDetails(doc, booking, primaryColor, lightGray);
      drawStudentDetails(doc, student, primaryColor, lightGray);
      drawInstructorDetails(doc, instructor, primaryColor, lightGray);
      drawVehicleDetails(doc, vehicle, primaryColor, lightGray);
      
      // Footer
      drawFooter(doc, secondaryColor);

      doc.end();
      stream.on("finish", () => resolve(filePath));
      
    } catch (error) {
      reject(error);
    }
  });
};

// Header Section
function drawHeader(doc, primaryColor, secondaryColor) {
  doc.rect(50, 50, 60, 60)
     .fillColor(secondaryColor)
     .fill();
  
  doc.fillColor('#ffffff')
     .fontSize(24)
     .text('RG', 65, 75);

  doc.fillColor(primaryColor)
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('RiyaGuru Driving School', 130, 60);
  
  doc.fontSize(14)
     .font('Helvetica')
     .fillColor('#7f8c8d')
     .text('Professional Driving Education', 130, 90);

  doc.strokeColor(secondaryColor)
     .lineWidth(2)
     .moveTo(50, 130)
     .lineTo(545, 130)
     .stroke();

  doc.y = 150;
}

// Status Badge
function drawStatusBadge(doc, status, accentColor) {
  const statusColors = {
    'confirmed': '#27ae60',
    'pending': '#f39c12',
    'cancelled': '#e74c3c',
    'completed': '#8e44ad'
  };

  const badgeColor = statusColors[status.toLowerCase()] || accentColor;
  const badgeText = status.toUpperCase();
  
  const badgeWidth = doc.widthOfString(badgeText) + 20;
  const badgeX = 545 - badgeWidth;
  
  doc.rect(badgeX, doc.y, badgeWidth, 25)
     .fillColor(badgeColor)
     .fill();
  
  doc.fillColor('#ffffff')
     .fontSize(10)
     .font('Helvetica-Bold')
     .text(badgeText, badgeX + 10, doc.y + 8);

  doc.y += 40;
}

// Section Header Helper
function drawSectionHeader(doc, title, primaryColor, lightGray) {
  const sectionY = doc.y;
  
  doc.rect(50, sectionY, 495, 30)
     .fillColor(lightGray)
     .fill();
  
  doc.fillColor(primaryColor)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(title, 60, sectionY + 8);
  
  doc.y = sectionY + 40;
}

// Booking Details Section
function drawBookingDetails(doc, booking, primaryColor, lightGray) {
  drawSectionHeader(doc, 'BOOKING DETAILS', primaryColor, lightGray);
  
  const bookingData = [
    ['Booking ID:', booking.bookingId],
    ['Date:', new Date(booking.date).toLocaleDateString()],
    ['Time:', booking.time],
    ['Status:', booking.status]
  ];

  drawDataTable(doc, bookingData, primaryColor);
  doc.y += 15;
}

// Student Details Section
function drawStudentDetails(doc, student, primaryColor, lightGray) {
  drawSectionHeader(doc, 'STUDENT INFORMATION', primaryColor, lightGray);
  
  const studentData = [
    ['Name:', student.full_name],
    ['NIC:', student.nic],
    ['Phone:', student.phone],
    ['Address:', student.address]  // ✅ added address
  ];

  drawDataTable(doc, studentData, primaryColor);
  doc.y += 15;
}

// Instructor Details Section
function drawInstructorDetails(doc, instructor, primaryColor, lightGray) {
  drawSectionHeader(doc, 'INSTRUCTOR INFORMATION', primaryColor, lightGray);
  
  const instructorData = [
    ['Name:', instructor.name],
    ['Phone:', instructor.phone],
    ['Specialization:', instructor.specialization]
  ];

  drawDataTable(doc, instructorData, primaryColor);
  doc.y += 15;
}

// Vehicle Details Section
function drawVehicleDetails(doc, vehicle, primaryColor, lightGray) {
  drawSectionHeader(doc, 'VEHICLE INFORMATION', primaryColor, lightGray);
  
  const vehicleData = [
    ['Registration:', vehicle.regNo],
    ['Vehicle:', `${vehicle.brand} ${vehicle.model}`],
    ['Type:', vehicle.type]
  ];

  drawDataTable(doc, vehicleData, primaryColor);
  doc.y += 15;
}

// Data Table Helper
function drawDataTable(doc, data, primaryColor) {
  const startY = doc.y;
  const rowHeight = 18;
  
  data.forEach((row, index) => {
    const currentY = startY + (index * rowHeight);
    
    if (index % 2 === 0) {
      doc.rect(50, currentY - 2, 495, rowHeight)
         .fillColor('#f8f9fa')
         .fill();
    }
    
    doc.fillColor(primaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(row[0], 60, currentY);
    
    doc.fillColor('#2c3e50')
       .fontSize(11)
       .font('Helvetica')
       .text(row[1], 180, currentY);
  });
  
  doc.y = startY + (data.length * rowHeight);
}

// Footer Section
function drawFooter(doc, secondaryColor) {
  doc.y = 750;
  
  doc.strokeColor(secondaryColor)
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  
  doc.y += 10;
  
  doc.fillColor('#7f8c8d')
     .fontSize(10)
     .font('Helvetica')
     .text('Important: Please arrive 10 minutes before your scheduled lesson time.', 50, doc.y);
  
  doc.y += 12;
  doc.text('For any changes or cancellations, please contact us at least 24 hours in advance.', 50, doc.y);
  
  doc.y += 20;
  
  doc.fillColor(secondaryColor)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('RiyaGuru Driving School', { align: 'center' });
  
  doc.fillColor('#7f8c8d')
     .fontSize(10)
     .font('Helvetica')
     .text('Email: info@riyaguru.lk | Phone: +94 XX XXX XXXX | Web: www.riyaguru.lk', { align: 'center' });
  
  doc.y += 10;
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
}

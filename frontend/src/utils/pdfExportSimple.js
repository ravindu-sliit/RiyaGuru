// frontend/src/utils/pdfExportSimple.js
import { jsPDF } from "jspdf";

/**
 * Helper function to convert image URL to base64 with circular crop
 */
async function getImageBase64(url, circular = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      
      if (circular) {
        // Create circular crop
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        
        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw image centered
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      }
      
      try {
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = function() {
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Creates a default user icon as base64
 */
function getDefaultUserIcon() {
  // Create a simple SVG user icon and convert to data URL
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)"/>
      <circle cx="100" cy="75" r="35" fill="#ffffff" opacity="0.9"/>
      <path d="M 40 180 Q 40 120 100 120 Q 160 120 160 180 Z" fill="#ffffff" opacity="0.9"/>
    </svg>
  `;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/**
 * Generates and downloads a PDF with student details (simple version without autoTable)
 * @param {Object} student - Student object containing all details
 */
export async function exportStudentDetailsToPDF(student) {
  if (!student) {
    console.error("No student data provided");
    return;
  }

  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Student Details - ${student.full_name}`,
      subject: "Student Information",
      author: "RiyaGuru Driving School",
      keywords: "student, details, driving school",
      creator: "RiyaGuru Admin System"
    });

    // Add header with blue background
    doc.setFillColor(37, 99, 235); // Blue color
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RiyaGuru Driving School", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Student Details Report", 105, 30, { align: "center" });

    // Reset text color for body
    doc.setTextColor(0, 0, 0);

    // Load and add profile picture (circular, to the left of name)
    const imgSize = 25; // Size in mm
    const imgX = 20; // Left margin
    const imgY = 48; // Top position
    
    try {
      let profileImageData;
      if (student.profilePicUrl) {
        // Try to load the actual profile picture with circular crop
        profileImageData = await getImageBase64(student.profilePicUrl, true);
      } else {
        // Use default icon
        profileImageData = getDefaultUserIcon();
      }
      
      // Add the circular image
      doc.addImage(profileImageData, "PNG", imgX, imgY, imgSize, imgSize);
      
      // Add a subtle border circle around the image
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, "S");
    } catch (error) {
      console.warn("Could not load profile picture, using default:", error);
      // Use default icon if loading fails
      try {
        const defaultIcon = getDefaultUserIcon();
        doc.addImage(defaultIcon, "PNG", imgX, imgY, imgSize, imgSize);
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.3);
        doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, "S");
      } catch (e) {
        console.error("Failed to add default icon:", e);
      }
    }

    // Add student name as main heading (to the right of profile picture)
    const textStartX = imgX + imgSize + 8; // 8mm gap after image
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(student.full_name || "N/A", textStartX, imgY + 10);

    // Add student ID (below name, aligned with name)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Student ID: ${student.studentId || "N/A"}`, textStartX, imgY + 17);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Add details manually
    let yPos = 85;
    const lineHeight = 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Student Information", 20, yPos);
    
    yPos += lineHeight + 5;
    doc.setFontSize(11);
    
    // Email
    doc.setFont("helvetica", "bold");
    doc.text("Email:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(student.email || "Not provided", 60, yPos);
    yPos += lineHeight;
    
    // Phone
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(student.phone || "Not provided", 60, yPos);
    yPos += lineHeight;
    
    // NIC
    doc.setFont("helvetica", "bold");
    doc.text("NIC:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(student.nic || "Not provided", 60, yPos);
    yPos += lineHeight;
    
    // Birth Year
    doc.setFont("helvetica", "bold");
    doc.text("Birth Year:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(student.birthyear ? String(student.birthyear) : "Not provided", 60, yPos);
    yPos += lineHeight;
    
    // Gender
    doc.setFont("helvetica", "bold");
    doc.text("Gender:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(student.gender || "Not provided", 60, yPos);
    yPos += lineHeight;
    
    // Address
    doc.setFont("helvetica", "bold");
    doc.text("Address:", 20, yPos);
    doc.setFont("helvetica", "normal");
    const address = student.address || "Not provided";
    // Split long addresses
    const addressLines = doc.splitTextToSize(address, 130);
    doc.text(addressLines, 60, yPos);

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    
    // Add date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    doc.text(
      `Generated on ${dateStr} at ${timeStr}`,
      20,
      pageHeight - 10
    );
    
    // Add page number
    doc.text(
      "Page 1 of 1",
      doc.internal.pageSize.width - 20,
      pageHeight - 10,
      { align: "right" }
    );

    // Generate filename
    const sanitizedName = (student.full_name || "student")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `student_${sanitizedName}_${student.studentId || "details"}.pdf`;

    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

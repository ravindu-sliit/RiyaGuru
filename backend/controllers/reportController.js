import Report from "../models/report.js";
import Maintenance from "../models/Maintenance.js";

// ➕ Generate Report (Generic)
export const generateReport = async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📊 Get All Reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("generatedBy", "username email");
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📈 Maintenance Analytics Example
export const getMaintenanceAnalytics = async (req, res) => {
  try {
    const analytics = await Maintenance.aggregate([
      {
        $group: {
          _id: "$serviceType",
          totalCost: { $sum: { $toDouble: "$cost" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalCost: -1 } },
    ]);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

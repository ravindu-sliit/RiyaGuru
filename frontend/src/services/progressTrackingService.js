const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const progressTrackingService = {
  async getAllProgress() {
    const res = await fetch(`${API_URL}/progress-tracking`);
    if (!res.ok) throw new Error("Failed to fetch progress records");
    return res.json();
  },

  async manualUpdateProgress(studentId, courseName) {
    const res = await fetch(`${API_URL}/progress-tracking/update/${studentId}/${courseName}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to update progress");
    return res.json();
  },

  async issueCertificate(studentId, courseName) {
    const res = await fetch(`${API_URL}/progress-tracking/issue/${studentId}/${courseName}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to issue certificate");
    return res.json();
  },
};

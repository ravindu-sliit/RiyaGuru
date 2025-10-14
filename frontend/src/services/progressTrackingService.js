const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const progressTrackingService = {
  async getAllProgress() {
    const rawAuth = localStorage.getItem("rg_auth") || localStorage.getItem("rg_token");
    let token = null;
    try {
      const parsed = JSON.parse(rawAuth || "null");
      token = parsed?.token || rawAuth;
    } catch (e) {
      token = rawAuth;
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/progress-tracking`, { headers });
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

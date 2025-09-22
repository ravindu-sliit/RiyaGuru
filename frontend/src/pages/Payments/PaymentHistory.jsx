import React, { useEffect, useState } from "react";
import axios from "axios";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/payments")
      .then(res => setPayments(res.data.payments));
  }, []);

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen">
      <h1 className="text-2xl font-bold text-[#1A2E40] mb-6">📜 Payment History</h1>
      {payments.map((p) => (
        <div key={p._id} className="bg-white border-l-4 mb-3 p-3 rounded shadow"
          style={{ borderColor: p.status === "Approved" ? "#008C52" : p.status === "Rejected" ? "#D82F2F" : "#F8D009" }}>
          <p>Course: {p.studentCourseId}</p>
          <p>Amount: Rs.{p.amount}</p>
          <p>Status: {p.status}</p>
          {p.status === "Approved" && (
            <a href={`http://localhost:5000/api/receipts/${p._id}`} target="_blank"
              className="text-[#1A2E40] underline">Download Receipt</a>
          )}
        </div>
      ))}
    </div>
  );
}

export default PaymentHistory;

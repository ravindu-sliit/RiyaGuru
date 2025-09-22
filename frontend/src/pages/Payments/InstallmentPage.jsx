import React, { useEffect, useState } from "react";
import axios from "axios";

function InstallmentPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/installments?studentId=S001") // replace with logged user
      .then(res => setPlans(res.data.plans));
  }, []);

  const payInstallment = async (planId, number) => {
    await axios.patch(`http://localhost:5000/api/installments/${planId}/pay`, {
      installmentNumber: number,
      paymentMethod: "Card"
    });
    alert("✅ Paid installment " + number);
  };

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen">
      <h1 className="text-2xl font-bold text-[#1A2E40] mb-6">📅 My Installments</h1>
      {plans.map((p) => (
        <div key={p._id} className="bg-[#A8D0E6] p-4 rounded-xl mb-4 shadow">
          <h2 className="font-semibold text-[#2D2D2D]">Course: {p.courseId}</h2>
          <p>Remaining: Rs.{p.remainingAmount}</p>
          <div className="mt-3 space-y-2">
            {p.schedule.map((i) => (
              <div key={i.installmentNumber} className="flex justify-between bg-white p-2 rounded">
                <span>Installment {i.installmentNumber} - Rs.{i.amount}</span>
                <span className={i.status === "Approved" ? "text-[#008C52]" : "text-[#F8D009]"}>
                  {i.status}
                </span>
                {i.status === "Pending" && (
                  <button onClick={() => payInstallment(p._id, i.installmentNumber)}
                    className="bg-[#1A2E40] text-white px-3 py-1 rounded hover:bg-[#FFD60A] hover:text-[#2D2D2D]">
                    Pay
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default InstallmentPage;

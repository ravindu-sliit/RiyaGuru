import React, { useState } from "react";
import axios from "axios";

function PaymentPage() {
  const [studentCourseId, setStudentCourseId] = useState(""); // enrollment id
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Full");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const pay = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/payments", {
        student_course_id: studentCourseId,  // 👈 enrollment id
        amount,
        paymentType,
        paymentMethod,
        cardDetails: {
          cardNumber,
          cardHolder,
          expiryDate,
          cvv,
        },
      });

      alert("✅ Payment successful: " + JSON.stringify(res.data));
    } catch (err) {
      if (err.response) {
        alert("❌ Backend error: " + JSON.stringify(err.response.data));
      } else if (err.request) {
        alert("❌ No response from server");
      } else {
        alert("❌ Frontend error: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border border-[#A8D0E6]">
        <h2 className="text-xl font-bold mb-4 text-[#2D2D2D]">💳 Make a Payment</h2>

        <input
          type="text"
          placeholder="Student Course ID (enrollment id)"
          value={studentCourseId}
          onChange={(e) => setStudentCourseId(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />

        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        >
          <option value="Full">Full</option>
          <option value="Installment">Installment</option>
        </select>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        >
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
        </select>

        {paymentMethod === "Card" && (
          <>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="border p-2 mb-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="Card Holder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="border p-2 mb-2 w-full rounded"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border p-2 mb-2 w-1/2 rounded"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="border p-2 mb-2 w-1/2 rounded"
              />
            </div>
          </>
        )}

        <button
          onClick={pay}
          className="bg-[#FFD60A] text-[#2D2D2D] font-bold w-full py-2 rounded hover:bg-yellow-400"
        >
          Submit Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;

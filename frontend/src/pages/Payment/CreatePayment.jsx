import React, { useState } from "react";
import NormalPayment from "./NormalPayment";
import InstallmentPayment from "./InstallmentPayment";

const CreatePayment = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const totalAmount = urlParams.get("totalAmount");
  const courseName = urlParams.get("courseName");
  const courseId = urlParams.get("courseId");
  const queryPaymentType = urlParams.get("paymentType");
  const initialTab = window.location.hash === "#installment" ? "installment" : "normal";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ backgroundColor: "#F5F6FA" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("normal")}
              className={`flex-1 py-6 px-8 text-lg font-semibold transition-all duration-300 relative ${
                activeTab === "normal"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor:
                  activeTab === "normal" ? "#F47C20" : "transparent",
              }}
            >
              Normal Payment
              {activeTab === "normal" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: "#FFC107" }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("installment")}
              className={`flex-1 py-6 px-8 text-lg font-semibold transition-all duration-300 relative ${
                activeTab === "installment"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor:
                  activeTab === "installment" ? "#F47C20" : "transparent",
              }}
            >
              Installment Payment
              {activeTab === "installment" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: "#FFC107" }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <div className="transition-all duration-500 ease-in-out">
              {activeTab === "normal" && (
                <div className="animate-fade-in">
                  <NormalPayment
                    totalAmount={totalAmount}
                    courseName={courseName}
                    courseId={courseId}
                    initialPaymentType={queryPaymentType === 'Installment' ? 'Installment' : 'Full'}
                    studentId={localStorage.getItem("rg_userId")}
                    onSwitchTab={(tab) => {
                      if (tab === "installment") {
                        window.location.hash = "#installment";
                      } else {
                        window.location.hash = "#normal";
                      }
                      setActiveTab(tab);
                    }}
                  />
                </div>
              )}
              {activeTab === "installment" && (
                <div className="animate-fade-in">
                  <InstallmentPayment
                    totalAmount={totalAmount}
                    courseName={courseName}
                    courseId={courseId}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePayment;

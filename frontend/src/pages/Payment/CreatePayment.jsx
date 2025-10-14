import React, { useState } from "react";
import NormalPayment from "./NormalPayment";
import InstallmentPayment from "./InstallmentPayment";
import ProgressHero from "../../components/ProgressHero";
import { CreditCard } from "lucide-react";

const CreatePayment = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const totalAmount = urlParams.get("totalAmount");
  const courseName = urlParams.get("courseName");
  const courseId = urlParams.get("courseId");
  const queryPaymentType = urlParams.get("paymentType");
  const initialTab = window.location.hash === "#installment" ? "installment" : "normal";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showTabs, setShowTabs] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 student-surface">
      {/* Hero — match Progress/My Enrollments */}
      <div className="px-6 pt-6">
        <ProgressHero
          title="Make a Payment"
          subtitle={`${courseName || "Course"} • Total: ${totalAmount || 0}`}
          icon={<CreditCard className="w-8 h-8 text-white" />}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          {showTabs && (
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("normal")}
              className={`flex-1 py-5 px-8 text-base md:text-lg font-semibold transition-all duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                activeTab === "normal"
                  ? "bg-orange-500 text-white"
                  : "bg-transparent text-gray-700 hover:text-gray-900"
              }`}
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
              className={`flex-1 py-5 px-8 text-base md:text-lg font-semibold transition-all duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                activeTab === "installment"
                  ? "bg-orange-500 text-white"
                  : "bg-transparent text-gray-700 hover:text-gray-900"
              }`}
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
          )}

          {/* Tab Content */}
          <div className="p-6 md:p-8 lg:p-10">
            <div className="transition-all duration-500 ease-in-out">
              {activeTab === "normal" && (
                <div className="animate-fade-in">
                  <NormalPayment
                    totalAmount={totalAmount}
                    courseName={courseName}
                    courseId={courseId}
                    initialPaymentType={queryPaymentType === 'Installment' ? 'Installment' : 'Full'}
                    studentId={localStorage.getItem("rg_userId")}
                    onSuccess={() => setShowTabs(false)}
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

import React, { useEffect, useState } from "react";
import MyPayments from "./MyPayments";
import MyInstallments from "./MyInstallments";

const PaymentsHub = () => {
  // Tabs with deep-link support (?tab=full|installment)
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const t = (params.get("tab") || "full").toLowerCase();
    return t === "installment" ? "installment" : "full";
  };
  const [tab, setTab] = useState(getInitialTab());

  useEffect(() => {
    const onPop = () => setTab(getInitialTab());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const switchTab = (next) => {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  return (
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage Full payments and Installment plans in one place.</p>
        </div>

        {/* Tabs header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => switchTab("full")}
              className={`flex-1 py-3 text-center text-sm font-semibold rounded-md border transition-colors ${tab === "full" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"}`}
            >
              Full Payments
            </button>
            <button
              onClick={() => switchTab("installment")}
              className={`flex-1 py-3 text-center text-sm font-semibold rounded-md border transition-colors ${tab === "installment" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"}`}
            >
              Installments
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="mt-8" />

        {/* Tab Content */}
        {tab === "full" ? (
          <MyPayments />
        ) : (
          <MyInstallments />
        )}
      </div>
  );
}
;

export default PaymentsHub;

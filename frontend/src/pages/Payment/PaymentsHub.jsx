import React, { useEffect, useState } from "react";
import MyPayments from "./MyPayments";
import MyInstallments from "./MyInstallments";
import ProgressHero from "../../components/ProgressHero";
import { CreditCard } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <ProgressHero
          title="My Payments"
          subtitle="View and manage your payment history."
          icon={<CreditCard className="w-8 h-8 text-white" />}
        />
      </div>

      {/* Tabs under hero */}
      <div className="px-6 mt-4">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button
            onClick={() => switchTab("full")}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg border transition-colors ${
              tab === "full"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Full Payments
          </button>
          <button
            onClick={() => switchTab("installment")}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg border transition-colors ${
              tab === "installment"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Installments
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {tab === "full" ? <MyPayments /> : <MyInstallments />}
      </div>
    </div>
  );
}
;

export default PaymentsHub;

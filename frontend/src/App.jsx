import "./App.css";
import { Routes, Route } from "react-router-dom";
import PaymentPage from "./pages/Payments/PaymentPage";
import InstallmentPage from "./pages/Payments/InstallmentPage";
import PaymentHistory from "./pages/Payments/PaymentHistory";
import AdminPayments from "./pages/Payments/AdminPayments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaymentPage />} />
      <Route path="/installments" element={<InstallmentPage />} />
      <Route path="/history" element={<PaymentHistory />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
    </Routes>
  );
}

export default App;

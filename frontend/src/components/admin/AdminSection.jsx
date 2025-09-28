import React from "react";
import { Outlet } from "react-router-dom";
import AdminPageHeader from "./AdminPageHeader";

/*
  Route-level wrapper to show a consistent admin header for a section.
  Use in routes like:
    <Route element={<AdminSection title="Payment Management" icon={<CreditCard className="w-6 h-6 text-white" />} subtitle="..." /> }>
      <Route path="payments" element={<AdminPayments />} />
    </Route>
*/

const AdminSection = ({ title, subtitle, icon, actions }) => {
  return (
    <>
      <AdminPageHeader title={title} subtitle={subtitle} icon={icon} actions={actions} />
      <Outlet />
    </>
  );
};

export default AdminSection;

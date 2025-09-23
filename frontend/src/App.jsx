import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext"; 

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </div>
  );
}

export default App;

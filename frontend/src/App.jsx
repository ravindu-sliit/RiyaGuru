import React from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import Payment from "./Components/Payment/Payment"; 

function App() {
  return ( 
    <div>
      <React.Fragment>
        <Routes>
              <Route path="/Payment" element={<Payment />} /> 
        </Routes>
      </React.Fragment>
    </div>
  );
}
export default App;

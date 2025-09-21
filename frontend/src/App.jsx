import React from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import Home from "./Pages/Home/Home";
import User from "./Pages/Add User/User";
import Users from "./Pages/UserDetails/Users";

function App() {
  return ( 
    <div>
      <Home></Home>

      <React.Fragment>
        <Routes>
          <Route path="/mainhome" element={<Home/>}/>
           <Route path="/adduser" element={<User/>}/>
            <Route path="/userdetails" element={<Users/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}


export default App;

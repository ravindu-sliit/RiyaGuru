import React from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import Home from "./Components/Home/Home";
import User from "./Components/Add User/User";
import Users from "./Components/UserDetails/Users";

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

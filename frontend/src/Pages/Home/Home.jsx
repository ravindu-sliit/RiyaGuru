import React from "react";
import Nav from "../Nav/Nav"

function Home() {
  console.log("✅ Home component rendered");
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>

        <Nav/>
      <h1 style={{ color: "red", fontSize: "48px" }}>HELLO FROM HOME
       
      </h1>
    </div>
  );
}

export default Home;

import React from 'react';
import './nav.css'
import {Link} from "react-router-dom";

function Nav() {
  return (
    <div>
     <ul className="Home-ul">
      <li className="home-ll">
        <Link to ="/mainHome" className="active home- a">
        <h1>home</h1>
        </Link>
      </li>

      <li className="home-ll">
        <Link to ="/adduser" className="active home- a">
        <h1>Add user</h1>
        </Link>
      </li>
      <li className="home-ll">
        <Link to ="/userdetails" className="active home- a">
        <h1>user details</h1>
        </Link>
      </li>
    </ul>
    </div>
  )
}

export default Nav

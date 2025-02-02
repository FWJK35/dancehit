import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./Home.css";
import { UserContext } from "../App";

const Home = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <>
      <header>
        <h1>DANCE DANCE REVOLUTION</h1>
      </header>
      <main>
        <div className="button-container">
          <a href="/game" className="button">
            Play
          </a>
          <a href="/instructions" className="button">
            Instructions
          </a>
        </div>
      </main>
      <img src="../../public/dancer.png" alt="Dancer" className="image-central" />
    </>
  );
};

export default Home;

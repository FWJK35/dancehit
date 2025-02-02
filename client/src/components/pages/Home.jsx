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
            <div class="button-container">
                <a href="src/pages/play.html" class="button">Play</a>
                <a href="src/pages/instructions.html" class="button">Instructions</a>
            </div>
        </main>
        <img src="C:\Users\aksha\Downloads\New Piskel (8).png" alt="Dancer" class="image-central"/>
        </>
  );
};

export default Home;

import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./Home.css";
import { UserContext } from "../App";

const Home = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <>
      <div class="button-container">
        <a href="/game" class="button">
          Play
        </a>
        <a href="/instructions" class="button">
          Instructions
        </a>
        <a href="/game">To video feed thing</a>
      </div>
    </>
  );
};

export default Home;

import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import dancer from "../dancer.png";

import "../../utilities.css";
import "./Home.css";
import { UserContext } from "../App";

const Home = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <>
      <div className="homeDiv">
        <img src={dancer} alt="Dancer" className="image-lower" />
        <header>
          <h1 className="press-start-2p-regular">Pocket Dance</h1>
        </header>
        <main>
          <div className="button-container">
            <a href="/game" className="button press-start-2p-regular">
              Play
            </a>
            <a href="/instructions" className="button press-start-2p-regular">
              Instructions
            </a>
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;

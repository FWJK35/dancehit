import { useRef, useState } from "react";
import PoseDetection from "../modules/PoseDetection";
import AudioUpload from "../modules/AudioUpload";
import { startCalibration, startGame } from "../../game-logic";

const Game = () => {
  const [countdown, setCountdown] = useState(-1);

  const handleStartCalibration = () => {
    console.log("Starting calibration");
    startCalibration(setCountdown);
  };

  const handleGameStart = () => {
    console.log("Starting game");
  };

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);

  return (
    <div>
      <h1>My Pose-Controlled Game</h1>
      <PoseDetection canvasRef={canvasRef} webcamRef={webcamRef} />

      <button onClick={handleStartCalibration}>Start Calibration</button>
      <button onClick={handleGameStart}>Start Game</button>

      {countdown > 0 ? <h2>{countdown}</h2> : null}

      <AudioUpload />
    </div>
  );
};

export default Game;

import { useRef, useState } from "react";
import PoseDetection from "./PoseDetection";
import { startCalibration } from "../../game-logic";

const Game = () => {
  const [countdown, setCountdown] = useState(-1);

  const handleStartCalibration = () => {
    console.log("Starting calibration");
    startCalibration(setCountdown);
  };

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);

  return (
    <div>
      <h1>My Pose-Controlled Game</h1>
      <PoseDetection canvasRef={canvasRef} webcamRef={webcamRef} />
      <button onClick={handleStartCalibration}>Start Calibration</button>
      {countdown > 0 ? <h2>{countdown}</h2> : null}
    </div>
  );
};

export default Game;

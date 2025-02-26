import { useRef, useState, useEffect } from "react";
import PoseDetection from "../modules/PoseDetection";
import SongsList from "../modules/SongsList";
import AudioUpload from "../modules/AudioUpload";
import ScoreKeeper from "../modules/ScoreKeeper";
import { startCalibration, startGame } from "../../game-logic";
import { get } from "../../utilities";
import "../NotFound.css";

const Game = () => {
  const [countdown, setCountdown] = useState(-1);
  const [beatMap, setBeatMap] = useState({});
  const [songs, setSongs] = useState(undefined);

  useEffect(() => {
    get("/api/songs").then((songs) => {
      setSongs(songs);
    });
  }, []);

  const handleStartCalibration = () => {
    console.log("Starting calibration");
    startCalibration(setCountdown);
  };

  const handleGameStart = () => {
    startGame();
    console.log("Starting game");
  };

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);

  return (
    <div>
      <h1 className="headerText">Pocket Dance</h1>
      <PoseDetection canvasRef={canvasRef} webcamRef={webcamRef} />
      <button className="button" onClick={handleStartCalibration}>
        Start Calibration
      </button>
      <button className="button" onClick={handleGameStart}>
        Start Game
      </button>
      <ScoreKeeper />
      {/* <button
        className="button"
        onClick={() => {
          get("/api/songs").then((songs) => {
            console.log(songs);
          });
        }}
      >
        Get Songs
      </button> */}
      {countdown > 0 ? <h2>{countdown}</h2> : null}
      <AudioUpload />
      {songs ? <SongsList songs={songs} /> : null}
    </div>
  );
};

export default Game;

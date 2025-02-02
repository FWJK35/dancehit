import React, { useEffect, useState } from "react";
import { getGameScore } from "../../game-logic"; // Import the score function

const ScoreKeeper = () => {
  const [score, setScore] = useState(getGameScore()); // Store score in state

  useEffect(() => {
    const interval = setInterval(() => {
      setScore(getGameScore()); // Update state every 50ms
    }, 50);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []); // Runs once on mount

  return (
    <div>
      <h2>Score: {score}</h2>
    </div>
  );
};

export default ScoreKeeper;

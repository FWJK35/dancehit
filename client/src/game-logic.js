let locations = {};

let poses;

const setPoses = (newPoses) => {
  poses = newPoses;
};

const calibrate = (keypoints) => {
  locations["rightFoot"] = keypoints.find((kp) => kp.name === "right_ankle");
  locations["leftFoot"] = keypoints.find((kp) => kp.name === "left_ankle");
  locations["rightHand"] = keypoints.find((kp) => kp.name === "right_wrist");
  locations["leftHand"] = keypoints.find((kp) => kp.name === "left_wrist");
};

const startCalibration = (setCountdown) => {
  let seconds = 5;
  setCountdown(seconds);
  console.log("Starting countdown");

  const coundownInterval = setInterval(() => {
    seconds--;
    setCountdown(seconds);
    if (seconds === 0) {
      clearInterval(coundownInterval);
      calibrate(poses[0].keypoints);
      setCountdown(-1);
      console.log("Calibration complete");
    }
  }, 1000);
};

const getLocations = () => {
  return locations;
};

const getPressed = (keypoints) => {
  const pressed = {};
  Object.values(locations).forEach((location) => {
    //If keypoint is found and strong enough
    const thisKp = keypoints.find((kp) => kp.name === location.name);
    if (thisKp.score > 0.5) {
      const distance = Math.sqrt(
        Math.pow(location.x - thisKp.x, 2) + Math.pow(location.y - thisKp.y, 2)
      );
      if (distance < 50) {
        return (pressed[location.name] = true);
      } else {
        return (pressed[location.name] = false);
      }
    }
  });
  return pressed;
};

export { locations, setPoses, calibrate, startCalibration, getLocations, getPressed };

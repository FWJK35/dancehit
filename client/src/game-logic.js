let locations = {
  rightFoot: { x: 0, y: 0 },
  rightHandWide: { x: 0, y: 0 },
  rightHandUp: { x: 0, y: 0 },
  leftFoot: { x: 0, y: 0 },
  leftHandWide: { x: 0, y: 0 },
  leftHandUp: { x: 0, y: 0 },
};

let poses;

let songTime = 0;

let noteQueue = [];

const fps = 60;

let inBox = {
  leftHandWide: false,
  rightHandWide: false,
  leftFoot: false,
  rightFoot: false,
  leftHandUp: false,
  rightHandUp: false,
};

const rectLen = 100;

const getLen = () => {
  return rectLen;
};

const setPoses = (newPoses) => {
  poses = newPoses;
};

const arePointsInSquare = (points, square) => {
  const [x, y, width, height] = square;

  return points.some(
    (point) => point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height
  );
};

const calibrate = (keypoints) => {
  if (keypoints.find((kp) => kp.name === "right_ankle")) {
    locations["rightFoot"] = keypoints.find((kp) => kp.name === "right_ankle");
  }

  if (keypoints.find((kp) => kp.name === "left_ankle")) {
    locations["leftFoot"] = keypoints.find((kp) => kp.name === "left_ankle");
  }

  if (keypoints.find((kp) => kp.name === "right_wrist")) {
    locations["rightHandWide"] = keypoints.find((kp) => kp.name === "right_wrist");

    const dist = Math.abs(
      locations["rightHandWide"].x - keypoints.find((kp) => kp.name === "right_shoulder").x
    );

    locations["rightHandUp"].x = keypoints.find((kp) => kp.name === "right_shoulder").x;
    locations["rightHandUp"].y = keypoints.find((kp) => kp.name === "right_shoulder").y - dist;
  }

  if (keypoints.find((kp) => kp.name === "left_wrist")) {
    locations["leftHandWide"] = keypoints.find((kp) => kp.name === "left_wrist");

    const dist = Math.abs(
      locations["leftHandWide"].x - keypoints.find((kp) => kp.name === "left_shoulder").x
    );

    locations["leftHandUp"].x = keypoints.find((kp) => kp.name === "left_shoulder").x;
    locations["leftHandUp"].y = keypoints.find((kp) => kp.name === "left_shoulder").y - dist;
  }
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

const startGame = () => {
  console.log("Starting game");
  songTime = 0;
  setInterval(() => {
    songTime += 1 / fps;
  }, 1000 / fps);
};

const getLocations = () => {
  return locations;
};

const addToQueue = (noteType, screenHeight) => {
  if (noteType === "rightFoot") {
    noteQueue.push({
      curX: locations["rightFoot"].x,
      curY: screenHeight,
      finY: locations["rightFoot"].y,
      noteType: "rightFoot",
    });
  } else if (noteType === "rightHandWide") {
    noteQueue.push({
      curX: locations["rightHandWide"].x,
      curY: 0,
      finY: locations["rightHandWide"].y,
      noteType: "rightHandWide",
    });
  } else if (noteType === "rightHandUp") {
    noteQueue.push({
      curX: locations["rightHandUp"].x,
      curY: 0,
      finY: locations["rightHandUp"].y,
      noteType: "rightHandUp",
    });
  } else if (noteType === "leftFoot") {
    noteQueue.push({
      curX: locations["leftFoot"].x,
      curY: screenHeight,
      finY: locations["leftFoot"].y,
      noteType: "leftFoot",
    });
  } else if (noteType === "leftHandWide") {
    noteQueue.push({
      curX: locations["leftHandWide"].x,
      curY: 0,
      finY: locations["leftHandWide"].y,
      noteType: "leftHandWide",
    });
  } else if (noteType === "leftHandUp") {
    noteQueue.push({
      curX: locations["leftHandUp"].x,
      curY: 0,
      finY: locations["leftHandUp"].y,
      noteType: "leftHandUp",
    });
  }
};

const getQueue = () => {
  return noteQueue;
};

const updateQueue = () => {
  // console.log(noteQueue);
  noteQueue.forEach((element, index) => {
    if (element.noteType === "rightFoot") {
      if (element.curY < element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY -= 2;
      }
    } else if (element.noteType === "rightHandWide") {
      if (element.curY > element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY += 2;
      }
    } else if (element.noteType === "rightHandUp") {
      if (element.curY > element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY += 2;
      }
    } else if (element.noteType === "leftFoot") {
      if (element.curY < element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY -= 2;
      }
    } else if (element.noteType === "leftHandWide") {
      if (element.curY > element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY += 2;
      }
    } else if (element.noteType === "leftHandUp") {
      if (element.curY > element.finY) {
        noteQueue.splice(index, index + 1);
      } else {
        element.curY += 2;
      }
    }
  });
};

const getPressed = (drawDot) => {
  const pressed = {};
  const keypoints = poses[0].keypoints;

  if (poses.length > 0) {
    const rightWrist = poses[0].keypoints.find((kp) => kp.name === "right_wrist");
    const rightIndex = poses[0].keypoints.find((kp) => kp.name === "right_index");
    const rightPinky = poses[0].keypoints.find((kp) => kp.name === "right_pinky");
    const rightThumb = poses[0].keypoints.find((kp) => kp.name === "right_thumb");

    const leftWrist = poses[0].keypoints.find((kp) => kp.name === "left_wrist");
    const leftIndex = poses[0].keypoints.find((kp) => kp.name === "left_index");
    const leftPinky = poses[0].keypoints.find((kp) => kp.name === "left_pinky");
    const leftThumb = poses[0].keypoints.find((kp) => kp.name === "left_thumb");

    const leftAnkle = poses[0].keypoints.find((kp) => kp.name === "left_ankle");
    const leftHeel = poses[0].keypoints.find((kp) => kp.name === "left_heel");
    const leftFeet = poses[0].keypoints.find((kp) => kp.name === "left_foot_index");

    const rightAnkle = poses[0].keypoints.find((kp) => kp.name === "right_ankle");
    const rightHeel = poses[0].keypoints.find((kp) => kp.name === "right_heel");
    const rightFeet = poses[0].keypoints.find((kp) => kp.name === "right_foot_index");

    const leftHand = [
      [leftWrist.x, leftWrist.y],
      [leftIndex.x, leftIndex.y],
      [leftPinky.x, leftPinky.y],
      [leftThumb.x, leftThumb.y],
    ];
    const rightHand = [
      [rightWrist.x, rightWrist.y],
      [rightIndex.x, rightIndex.y],
      [rightPinky.x, rightPinky.y],
      [rightThumb.x, rightThumb.y],
    ];
    const leftFoot = [
      [leftAnkle.x, leftAnkle.y],
      [leftHeel.x, leftHeel.y],
      [leftFeet.x, leftFeet.y],
    ];
    const rightFoot = [
      [rightAnkle.x, rightAnkle.y],
      [rightHeel.x, rightHeel.y],
      [rightFeet.x, rightFeet.y],
    ];

    const rfx = locations["rightFoot"].x;
    const rfy = locations["rightFoot"].y;
    const lfx = locations["leftFoot"].x;
    const lfy = locations["rightFoot"].y;

    const rhwx = locations["rightHandWide"].x;
    const rhwy = locations["rightHandWide"].y;
    const lhwx = locations["leftHandWide"].x;
    const lhwy = locations["leftHandWide"].y;

    const rhux = locations["rightHandUp"].x;
    const rhuy = locations["rightHandUp"].y;
    const lhux = locations["leftHandUp"].x;
    const lhuy = locations["leftHandUp"].y;

    inBox["leftHandWide"] = arePointsInSquare(leftHand, [
      lhwx - rectLen / 2,
      lhwy - rectLen / 2,
      rectLen,
      rectLen,
    ]);
    inBox["rightHandWide"] = arePointsInSquare(rightHand, [
      rhwx - rectLen / 2,
      rhwy - rectLen / 2,
      rectLen,
      rectLen,
    ]);
    inBox["leftHandUp"] = arePointsInSquare(leftHand, [
      lhux - rectLen / 2,
      lhuy - rectLen / 2,
      rectLen,
      rectLen,
    ]);
    inBox["rightHandUp"] = arePointsInSquare(rightHand, [
      rhux - rectLen / 2,
      rhuy - rectLen / 2,
      rectLen,
      rectLen,
    ]);
    inBox["rightFoot"] = arePointsInSquare(rightFoot, [
      rfx - rectLen / 2,
      rfy - rectLen / 2,
      rectLen,
      rectLen,
    ]);

    inBox["leftFoot"] = arePointsInSquare(leftFoot, [
      lfx - rectLen / 2,
      lfy - rectLen / 2,
      rectLen,
      rectLen,
    ]);

    // console.log(
    //   arePointsInSquare(leftHand, [lhux - rectLen / 2, lhuy - rectLen / 2, rectLen, rectLen])
    // );

    // console.log(
    //   arePointsInSquare(rightHand, [rhux - rectLen / 2, rhuy - rectLen / 2, rectLen, rectLen])
    // );

    Object.entries(inBox).forEach((point) => {
      if (inBox[point]) {
        drawDot(locations[point]);
      }
    });
  }

  return pressed;
};

export {
  setPoses,
  calibrate,
  startCalibration,
  startGame,
  getLocations,
  getPressed,
  getLen,
  getQueue,
  addToQueue,
  updateQueue,
};

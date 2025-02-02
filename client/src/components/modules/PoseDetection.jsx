import React, { useEffect, useContext, useState, use } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

import leftArrow from "./leftArrow.png";
import rightArrow from "./rightArrow.png";
import upArrow from "./upArrow.png";
import downArrow from "./downArrow.png";

import {
  setPoses,
  getLocations,
  getPressed,
  updateQueue,
  addToQueue,
  getQueue,
  getLen,
  getSongTime,
  getGameStarted,
  getOffset,
  getBeatMap,
  getFPS,
  getGameScore,
} from "../../game-logic";
const bitMap = [];
let arrows = {
  leftHandUp: {
    id: "leftHandUp",
    src: downArrow,
    size: 192,
  },
  leftHandWide: {
    id: "leftHandWide",
    src: rightArrow,
    size: 192,
  },
  leftFoot: {
    id: "leftFoot",
    src: rightArrow,
    size: 192,
  },
  rightFoot: {
    id: "rightFoot",
    src: leftArrow,
    size: 192,
  },
  rightHandWide: {
    id: "rightHandWide",
    src: leftArrow,
    size: 192,
  },
  rightHandUp: {
    id: "rightHandUp",
    src: downArrow,
    size: 192,
  },
};

const loadAsset = (asset) => {
  return new Promise((resolve, reject) => {
    const assetImage = new Image(asset.size, asset.size);
    assetImage.src = asset.src;
    assetImage.onload = () => resolve({ id: asset.id, imgObj: assetImage });
    assetImage.onerror = (e) => {
      reject(new Error(`Image does not exist. URL: ${asset.src}`));
    };
  });
};

const loadAssets = async () => {
  const loadedPlayers = await Promise.all(Object.values(arrows).map(loadAsset));
  loadedPlayers.forEach((asset) => {
    arrows[asset.id].imgObj = asset.imgObj;
  });
};

const PoseDetection = (props) => {
  const webcamRef = props.webcamRef;
  const canvasRef = props.canvasRef;

  if (
    typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  ) {
    const screenHeight = webcamRef.current.video.videoHeight;
  }

  const detect = async (detector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const poses = await detector.estimatePoses(video);

      setPoses(poses);
      // updateQueue();
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (poses, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    getPressed();
    updateQueue();

    // ✅ Save original state before transformations
    ctx.save();

    // ✅ Clear previous frame
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    // ✅ Set canvas size
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    // Flip the canvas horizontally (mirror effect)
    ctx.save(); // Save the original state
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0); // Move flipped content back into view

    // Draw the video (mirrored)
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Restore the canvas to normal for accurate keypoint drawing
    ctx.restore();

    // ✅ Flip canvas horizontally
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);

    // ✅ Draw mirrored video
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // ✅ Restore canvas so drawings aren't flipped
    ctx.restore();

    // ✅ Draw static elements (rectangles)
    Object.values(getLocations()).forEach((location) => {
      const squareLen = getLen();
      drawRectangle(
        ctx,
        location.x - squareLen / 2,
        location.y - squareLen / 2,
        squareLen,
        squareLen
      );
    });

    // replace drawRectangle with drawImage, and get it to drawImages based on the type of item
    getQueue().forEach((item) => {
      // console.log(Math.abs(item.curY - item.finY));
      // console.log(item.TimeToPoint);
      console.log(item);
      ctx.drawImage(
        arrows[item.noteType].imgObj,
        item.curX +
          ((item.finX - item.curX) * (getOffset() - item.TimeToPoint)) / getOffset() -
          getLen() / 2,
        item.curY +
          ((item.finY - item.curY) * (getOffset() - item.TimeToPoint)) / getOffset() -
          getLen() / 2,
        getLen(),
        getLen()
      );
      // drawRectangle(
      //   ctx,
      //   item.curX - getLen() / 2,
      //   item.curY +
      //     (Math.abs(item.curY - item.finY) * (getOffset() - item.TimeToPoint)) / getOffset() -
      //     getLen() / 2,
      //   getLen(),
      //   getLen()
      // );
    });

    // console.log(getGameScore());

    if (getGameStarted()) {
      const songTime = getSongTime(); //* getFPS();
      const beatMap = getBeatMap();
      const offset = getOffset();

      // console.log(beatMap);

      Object.keys(beatMap).forEach((timeStamp) => {
        // console.log(parseFloat(timeStamp) + " " + (songTime - offset));
        if (parseFloat(timeStamp) < songTime - offset) {
          let actions = beatMap[timeStamp];
          delete beatMap[timeStamp];

          actions.forEach((action) => {
            if (action === -3) {
              addToQueue("leftHandUp", window.innerHeight, window.innerWidth, offset);
            } else if (action === -2) {
              addToQueue("leftHandWide", window.innerHeight, window.innerWidth, offset);
            } else if (action === -1) {
              addToQueue("leftFoot", window.innerHeight, window.innerWidth, offset);
            } else if (action === 1) {
              addToQueue("rightFoot", window.innerHeight, window.innerWidth, offset);
            } else if (action === 2) {
              addToQueue("rightHandWide", window.innerHeight, window.innerWidth, offset);
            } else if (action === 3) {
              addToQueue("rightHandUp", window.innerHeight, window.innerWidth, offset);
            }
          });
        }
      });
    }

    if (poses.length > 0) {
      // ✅ Flip keypoints for mirrored skeleton
      const flippedKeypoints = poses[0].keypoints.map((kp) => ({
        ...kp,
        x: videoWidth - kp.x, // Flip X coordinate
      }));

      drawKeypoints(flippedKeypoints, ctx, videoWidth);
      // drawSkeleton(flippedKeypoints, ctx, videoWidth);
    }
  };

  const drawKeypoints = (keypoints, ctx, videoWidth) => {
    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2) {
        const { x, y } = keypoint;
        ctx.beginPath();
        ctx.arc(videoWidth - x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  const drawRectangle = (ctx, x, y, width, height) => {
    if (!ctx) {
      console.error("Canvas context is null!");
      return;
    }

    ctx.beginPath();
    ctx.rect(Math.floor(x), Math.floor(y), width, height);
    ctx.strokeStyle = "red"; // Optional: Add a border
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const drawSkeleton = (keypoints, ctx, videoWidth) => {
    const connections = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.BlazePose
    );

    connections.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      if (kp1.score > 0.2 && kp2.score > 0.2) {
        ctx.beginPath();
        ctx.moveTo(videoWidth - kp1.x, kp1.y); // Flip X coordinate
        ctx.lineTo(videoWidth - kp2.x, kp2.y); // Flip X coordinate
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  // Component logic will go here
  useEffect(() => {
    const runPoseDetection = async () => {
      await loadAssets(); // Wait for assets to load
      await tf.ready();
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        runtime: "tfjs",
      });
      setInterval(() => {
        detect(detector);
      }, 50);
    };

    runPoseDetection();
  }, []);

  return (
    <div>
      <Webcam ref={webcamRef} className="cameraFrame" />
      <canvas ref={canvasRef} className="mainCanvas" />
    </div>
  );
};

export default PoseDetection;

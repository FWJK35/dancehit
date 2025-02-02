import React, { useEffect, useContext, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { setPoses, getLocations, getPressed, getLen } from "../../game-logic";
import "./PoseDetection.css";

const PoseDetection = (props) => {
  const webcamRef = props.webcamRef;
  const canvasRef = props.canvasRef;

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
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (poses, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");

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

    getPressed((x, y) => {
      drawDot(ctx, x, y);
    });

    if (poses.length > 0) {
      // ✅ Flip keypoints for mirrored skeleton
      const flippedKeypoints = poses[0].keypoints.map((kp) => ({
        ...kp,
        x: videoWidth - kp.x, // Flip X coordinate
      }));

      drawKeypoints(flippedKeypoints, ctx, videoWidth);
      drawSkeleton(flippedKeypoints, ctx, videoWidth);
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

  const drawDot = (ctx, x, y, color = "blue") => {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
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
      <Webcam ref={webcamRef} className="webcam" />
      <canvas ref={canvasRef} className="game-display" />
    </div>
  );
};

export default PoseDetection;

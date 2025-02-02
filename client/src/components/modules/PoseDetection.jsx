import React, { useEffect, useContext } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { setPoses, getLocations } from "../../game-logic";
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

      if (poses.length > 0) {
        const rightWrist = poses[0].keypoints.find((kp) => kp.name === "right_wrist");
        if (rightWrist.score > 0.5) {
          // Use rightWrist.x and rightWrist.y to control game elements
          //updateGameState(rightWrist.x, rightWrist.y);
        }
      }

      setPoses(poses);
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (poses, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
    //gameLogic.setPoses(poses);
    Object.values(getLocations()).forEach((location) => {
      const circleSize = 20;
      const { x, y } = location;
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
    drawKeypoints(poses[0].keypoints, ctx);
    drawSkeleton(poses[0].keypoints, ctx);
  };

  const drawKeypoints = (keypoints, ctx) => {
    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2) {
        const { x, y } = keypoint;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  const drawSkeleton = (keypoints, ctx) => {
    const connections = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.BlazePose
    );

    connections.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      if (kp1.score > 0.2 && kp2.score > 0.2) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
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
      }, 100);
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

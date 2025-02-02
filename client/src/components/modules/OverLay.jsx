import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const OverLay = () => {
  const webcamRef = useRef(null);
  const [showElement, setShowElement] = useState(false);

  const handleAddElement = () => {
    setShowElement(true);
    setTimeout(() => setShowElement(false), 1000); // Element disappears after 1s
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Video Feed */}
      <Webcam
        ref={webcamRef}
        mirrored={true}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      />

      {/* Sliding Element */}
      {showElement && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-100px", // Start off-screen
            width: "80px",
            height: "80px",
            backgroundColor: "red",
            borderRadius: "50%",
            transform: "translateY(-50%)",
            animation: "slide-in 1s forwards",
            zIndex: 2,
          }}
        />
      )}

      {/* Button to Add Element */}
      <button
        onClick={handleAddElement}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        Add Element
      </button>

      {/* Keyframe Animation */}
      <style>
        {`
          @keyframes slide-in {
            0% { left: -100px; opacity: 0; }
            50% { left: 50%; opacity: 1; transform: translate(-50%, -50%); }
            100% { left: 50%; opacity: 0; transform: translate(-50%, -50%); }
          }
        `}
      </style>
    </div>
  );
};

export default OverLay;

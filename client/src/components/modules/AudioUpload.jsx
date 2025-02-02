import React, { useState, useEffect, useContext } from "react";
// import "./AudioUpload.css";
// import axios from "axios";
import { post } from "../../utilities";
import setBeatMap from "../../game-logic";

const AudioUpload = (props) => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an audio file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10 MB");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const thing = fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error processing audio file");
        })
        .then((data) => {
          setOutput(JSON.parse(data.data));
          setBeatMap(JSON.parse(data.data));
        });
    } catch (error) {
      console.error("Error processing audio:", error);
      setOutput("An error occurred while processing the audio file.");
    }
  };

  return (
    <div>
      <h2>Audio File Processor</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit">Process Audio</button>
      </form>
      {output && (
        <div>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;

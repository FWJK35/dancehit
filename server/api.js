/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const mongoose = require("mongoose");
const { MongoClient, Binary } = require("mongodb");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
const app = express();

const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

const upload = multer({ dest: "uploads/" });

router.post("/process-audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No audio file uploaded");
  }

  const inputFile = req.file.path;
  const outputFile = path.join("outputs", `${req.file.filename}.txt`);
  console.log(inputFile, outputFile);

  const pythonProcess = spawn("python", [
    path.join(__dirname, "beatmapGenerator.py"),
    inputFile,
    outputFile,
  ]);

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python script error: ${data}`);
  });

  //console.log(pythonProcess);
  pythonProcess.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  pythonProcess.on("exit", (code, signal) => {
    if (code === null) {
      console.log(`Child process terminated due to signal: ${signal}`);
    } else {
      console.log(`Child process exited with code: ${code}`);
    }
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
      return res.status(500).send("Error processing audio file");
    }

    fs.readFile(outputFile, "utf8", (err, data) => {
      console.log(typeof data);
      if (err) {
        return res.status(500).send("Error reading output file");
      }
      res.send({ data: data });
      //console.log(data);

      //Save the song to the database

      async function saveSmallFileToDB() {
        const uri = process.env.MONGO_SRV;
        const client = new MongoClient(uri);

        try {
          console.log("test3");
          await client.connect();
          const session = client.startSession();
          console.log("test4");
          const db = client.db("BeatBlast");
          const collection = db.collection("songs");

          const fileData = fs.readFileSync(inputFile);
          const songDocument = {
            name: req.file.originalname,
            beats: JSON.parse(data),
            data: new Binary(fileData),
          };

          await collection.insertOne(songDocument);
          await session.endSession();
          console.log("Small file saved to MongoDB");
        } finally {
          await client.close();
        }
      }
      saveSmallFileToDB().then(() => {
        console.log("unlinking");
        fs.unlink(inputFile, () => {});
        fs.unlink(outputFile, () => {});
      });

      // Clean up temporary files
      console.log("test5");
    });
  });
});

router.get("/songs", (req, res) => {
  console.log("get songs");
  async function getSongs() {
    const uri = process.env.MONGO_SRV;
    const client = new MongoClient(uri);
    try {
      console.log("test1");
      await client.connect();
      const session = client.startSession();

      console.log("test2");
      const db = client.db("BeatBlast");
      const collection = db.collection("songs");
      let songs = [];
      await (
        await collection.find({}).toArray()
      ).forEach((item) => {
        songs.push(item);
      });
      res.send(songs);
      console.log("test3");
      session.endSession();
    } finally {
      await client.close();
    }
  }
  getSongs();
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

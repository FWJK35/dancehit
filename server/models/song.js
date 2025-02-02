const mongoose = require("mongoose");

// const SongSchema = new mongoose.Schema({
//   name: String,
//   beats: {[]},
//   audio: Binary,
// });

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

import React from "react";
import { setAudio, setBeatMap, getSongName, setSongName } from "../../game-logic";

const SongsList = (props) => {
  return (
    <div>
      <h2>Songs List</h2>
      <ul>
        {props.songs.map((song) => (
          <li
            key={song._id}
            onClick={() => {
              setBeatMap(song.beats);
              setAudio(song.data);
              setSongName(song.name);
              console.log(song);
            }}
            className={"song" + (getSongName() === song.name ? " selected" : "")}
          >
            {song.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongsList;

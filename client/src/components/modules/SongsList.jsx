import React from "react";
import { setAudio, setBeatMap } from "../../game-logic";

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
              console.log(song);
            }}
            className={"song" + (props.currentSong === song.name ? " selected" : "")}
          >
            {song.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongsList;

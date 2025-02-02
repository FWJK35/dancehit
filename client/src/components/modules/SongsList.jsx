import React from "react";
import { setBeatMap } from "../../game-logic";

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
            }}
          >
            {song.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongsList;

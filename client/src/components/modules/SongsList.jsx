const SongsList = (props) => {
  return (
    <div>
      <h2>Songs List</h2>
      <ul>
        {props.songs.map((song) => (
          <li key={song._id}>{song.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SongsList;

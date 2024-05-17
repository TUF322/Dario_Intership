import React, { useRef, useState } from 'react';
import Controls from './Controls';
import DisplayAudio from './DisplayAudio';
import srcaudio from './AudioPlayerC/whale.mp3';
import '../index.css';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="audio-player">
      {/* Provide a valid source URL for your audio file */}
      <audio ref={audioRef} src={srcaudio}></audio>
      <div className="inner">
        <Controls audioRef={audioRef} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
    </div>
  );
};

export default AudioPlayer;

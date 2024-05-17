import React, { useEffect } from 'react';
import {
  IoPlayBackSharp,
  IoPlayForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
} from 'react-icons/io5';

const Controls = ({ isPlaying, setIsPlaying, audioRef }) => {
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  const skipTime = (seconds) => {
    audioRef.current.currentTime += seconds;
  };

  return (
    <div className="controls-wrapper">
      <div className="controls">
        <button onClick={() => skipTime(-30)}>
          <IoPlaySkipBackSharp />
        </button>
        <button onClick={() => skipTime(-10)}>
          <IoPlayBackSharp />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
        </button>
        <button onClick={() => skipTime(10)}>
          <IoPlayForwardSharp />
        </button>
        <button onClick={() => skipTime(30)}>
          <IoPlaySkipForwardSharp />
        </button>
      </div>
    </div>
  );
};

export default Controls;

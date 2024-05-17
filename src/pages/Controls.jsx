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

  const handleSkipBack = () => {
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  const handleSkipForward = () => {
    audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
  };

  const handleSkipBack30 = () => {
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 30);
  };

  const handleSkipForward30 = () => {
    audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 30);
  };

  return (
    <div className="controls-wrapper">
      <div className="controls">
        <button onClick={handleSkipBack30}>
          <IoPlaySkipBackSharp />
        </button>
        <button onClick={handleSkipBack}>
          <IoPlayBackSharp />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
        </button>
        <button onClick={handleSkipForward}>
          <IoPlayForwardSharp />
        </button>
        <button onClick={handleSkipForward30}>
          <IoPlaySkipForwardSharp />
        </button>
      </div>
    </div>
  );
};

export default Controls;

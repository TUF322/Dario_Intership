// src/components/Controls.jsx

import React, { useEffect, useState } from 'react';
import {
  IoPlayBackSharp,
  IoPlayForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoRepeat,
  IoResize,
} from 'react-icons/io5';

const Controls = ({ isPlaying, setIsPlaying, audioRef, wavesurferInstance }) => {
  const [isLooping, setIsLooping] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

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

  const handleLoopToggle = () => {
    setIsLooping(!isLooping);
    if (wavesurferInstance) {
      wavesurferInstance.setLoop(!isLooping);
    }
  };

  const handleZoom = () => {
    const newZoomLevel = zoomLevel === 1 ? 2 : 1;
    setZoomLevel(newZoomLevel);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(newZoomLevel * 100); // Adjust the zoom factor as needed
    }
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
        <button onClick={handleLoopToggle}>
          <IoRepeat color={isLooping ? 'green' : 'black'} />
        </button>
        <button onClick={handleZoom}>
          <IoResize />
        </button>
      </div>
    </div>
  );
};

export default Controls;

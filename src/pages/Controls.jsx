import React, { useEffect, useState } from 'react';
import {
  IoPlayBackSharp,
  IoPlayForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
} from 'react-icons/io5';

const Controls = ({ isPlaying, setIsPlaying, audioRef, wavesurferInstance }) => {
  const [loop, setLoop] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(10);

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

  const handleLoopChange = (e) => {
    setLoop(e.target.checked);
    if (wavesurferInstance) {
      wavesurferInstance.setLoop(e.target.checked);
    }
  };

  const handleZoomChange = (e) => {
    const newZoomLevel = Number(e.target.value);
    setZoomLevel(newZoomLevel);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(newZoomLevel);
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
      </div>
      <div className="additional-controls">
        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={handleLoopChange}
          />
          Loop regions
        </label>
        <label>
          Zoom:
          <input
            type="range"
            min="10"
            max="1000"
            value={zoomLevel}
            onChange={handleZoomChange}
          />
        </label>
      </div>
    </div>
  );
};

export default Controls;

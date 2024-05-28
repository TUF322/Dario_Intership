import React, { useState } from 'react';


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

const Controls = ({
  isPlaying,
  setIsPlaying,
  wavesurferInstance,
  wavesurferRegions,
  isLooping,
  setIsLooping,
  audioRef
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  
  const handlePlayPause = () => {
    setIsPlaying(prevIsPlaying => {
      const newIsPlaying = !prevIsPlaying;
      if (newIsPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return newIsPlaying;
    });
  };
  

  // Rest of your component code...


  const handleSkipBack = () => {
    if (wavesurferInstance) {
      wavesurferInstance.skipBackward(10);
    }
  };

  const handleSkipForward = () => {
    if (wavesurferInstance) {
      wavesurferInstance.skipForward(10);
    }
  };

  const handleSkipBack30 = () => {
    if (wavesurferInstance) {
      wavesurferInstance.skipBackward(30);
    }
  };

  const handleSkipForward30 = () => {
    if (wavesurferInstance) {
      wavesurferInstance.skipForward(30);
    }
  };

  const handleLoopToggle = () => {
    setIsLooping(prevLoop => !prevLoop);

    if (wavesurferRegions && wavesurferRegions.list) {
      // Check if there are any existing regions
      if (Object.keys(wavesurferRegions.list).length > 0) {
        // Set looping property of all existing regions based on current state
        for (const regionId in wavesurferRegions.list) {
          const region = wavesurferRegions.list[regionId];
          region.update({ loop: isLooping });
        }
      }
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
        <button onClick={handlePlayPause}>
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

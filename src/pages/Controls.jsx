import React, { useEffect, useState, useCallback } from 'react';
import {
  IoPlayBackSharp,
  IoPlayForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoRepeat,
} from 'react-icons/io5';
import PropTypes from 'prop-types';

const Controls = React.memo(({ isPlaying, setIsPlaying, audioRef, wavesurferInstance, isLooping, setIsLooping }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [lastRegionPlayed, setLastRegionPlayed] = useState(null);

  useEffect(() => {
    if (isPlaying) {
      wavesurferInstance.play();
    } else {
      wavesurferInstance.pause();
    }
  }, [isPlaying, wavesurferInstance]);

  const handleTimeUpdate = useCallback(() => {
    if (wavesurferInstance && isLooping) {
      const currentTime = wavesurferInstance.getCurrentTime();
      const regions = wavesurferInstance.regions.list;
      let currentRegion = null;
      for (let key in regions) {
        const region = regions[key];
        if (currentTime >= region.start && currentTime <= region.end) {
          currentRegion = region;
          break;
        }
      }
      if (currentRegion) {
        setLastRegionPlayed(currentRegion);
        if (currentTime >= currentRegion.end) {
          const keys = Object.keys(regions);
          const currentIndex = keys.indexOf(currentRegion.id);
          const nextIndex = (currentIndex + 1) % keys.length;
          const nextRegion = regions[keys[nextIndex]];
          wavesurferInstance.seekTo(nextRegion.start / wavesurferInstance.getDuration());
        }
      } else if (lastRegionPlayed) {
        wavesurferInstance.seekTo(lastRegionPlayed.start / wavesurferInstance.getDuration());
      } else if (Object.keys(regions).length > 0) {
        const firstRegion = regions[Object.keys(regions)[0]];
        wavesurferInstance.seekTo(firstRegion.start / wavesurferInstance.getDuration());
      }
    }
  }, [isLooping, wavesurferInstance, lastRegionPlayed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audioRef, handleTimeUpdate]);

  const handleSkipBack = useCallback(() => {
    wavesurferInstance.skipBackward(10);
  }, [wavesurferInstance]);

  const handleSkipForward = useCallback(() => {
    wavesurferInstance.skipForward(10);
  }, [wavesurferInstance]);

  const handleSkipBack30 = useCallback(() => {
    wavesurferInstance.skipBackward(30);
  }, [wavesurferInstance]);

  const handleSkipForward30 = useCallback(() => {
    wavesurferInstance.skipForward(30);
  }, [wavesurferInstance]);

  const handleLoopToggle = useCallback(() => {
    setIsLooping((prevLoop) => !prevLoop);
  }, [setIsLooping]);

  const handleZoom = useCallback((zoomValue) => {
    setZoomLevel(zoomValue);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(zoomValue);
    }
  }, [wavesurferInstance]);

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
        <input
          type="range"
          min="0"
          max="1500"
          value={zoomLevel}
          onChange={(e) => handleZoom(e.target.valueAsNumber)}
        />
      </div>
      <div id="wave-timeline"></div>
    </div>
  );
});

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  audioRef: PropTypes.object.isRequired,
  wavesurferInstance: PropTypes.object.isRequired,
  isLooping: PropTypes.bool.isRequired,
  setIsLooping: PropTypes.func.isRequired,
};

export default Controls;
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import PropTypes from 'prop-types';
import styled from "styled-components";

const Container = styled.section`
  display: flex;
  justify-content: center;
  margin-top: 50px;
  border-radius: 15px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    font-size: 24px;
  }
`;

const Controls = React.memo(({ isPlaying, setIsPlaying, audioRef, wavesurferInstance, wavesurferRegions, isLooping, setIsLooping }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastRegionPlayed, setLastRegionPlayed] = useState(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  const handleTimeUpdate = useCallback(() => {
    if (wavesurferRegions && isLooping) {
      const currentTime = audioRef.current.currentTime;
      const regions = wavesurferRegions.getRegions ? Object.values(wavesurferRegions.getRegions()) : [];

      let currentRegion = null;
      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        if (currentTime >= region.start && currentTime <= region.end) {
          currentRegion = region;
          break;
        }
      }

      if (currentRegion) {
        setLastRegionPlayed(currentRegion);

        if (currentTime >= currentRegion.end) {
          const currentIndex = regions.findIndex(region => region.id === currentRegion.id);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % regions.length;
            const nextRegion = regions[nextIndex];
            audioRef.current.currentTime = nextRegion.start;
          }
        }
      } else if (lastRegionPlayed) {
        audioRef.current.currentTime = lastRegionPlayed.start;
      } else if (regions.length > 0) {
        audioRef.current.currentTime = regions[0].start;
      }
    }
  }, [audioRef, isLooping, wavesurferRegions, lastRegionPlayed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audioRef, handleTimeUpdate]);

  const handleControlClick = (val, forward= false) => {
    if (forward) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + val);
    } else {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - val);
    }
  }

  const handleLoopToggle = useCallback(() => {
    setIsLooping((prevLoop) => !prevLoop);
  }, [setIsLooping]);

  const handleZoom = (zoomValue) => {
    setZoomLevel(zoomValue);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(zoomValue);
    }
  };

  return (
    <Container>

        <button onClick={() => handleControlClick(30)}>
          <IoPlaySkipBackSharp />
        </button>
        <button onClick={() => handleControlClick(10)}>
          <IoPlayBackSharp />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
        </button>
        <button onClick={() => handleControlClick(10, true)}>
          <IoPlayForwardSharp />
        </button>
        <button onClick={() => handleControlClick(30, true)}>
          <IoPlaySkipForwardSharp />
        </button>
        <button onClick={handleLoopToggle}>
          <IoRepeat color={isLooping ? 'green' : 'black'} />
        </button>
        <input
          type="range"
          min="0"
          max="1200"
          value={zoomLevel}
          onChange={(e) => handleZoom(e.target.valueAsNumber)}
        />

    </Container>
  );
});

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  audioRef: PropTypes.object.isRequired,
  wavesurferInstance: PropTypes.object.isRequired,
  wavesurferRegions: PropTypes.object,
  isLooping: PropTypes.bool.isRequired,
  setIsLooping: PropTypes.func.isRequired,
};

export default Controls;

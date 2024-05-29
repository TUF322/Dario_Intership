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

const Controls = ({ isPlaying, setIsPlaying, audioRef, wavesurferInstance, wavesurferRegions, isLooping, setIsLooping }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastRegionPlayed, setLastRegionPlayed] = useState(null); // Define lastRegionPlayed state

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const handleTimeUpdate = () => {
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
          console.log('Entered region:', currentRegion);
          console.log('Region start time:', currentRegion.start);
          console.log('Region end time:', currentRegion.end);
          setLastRegionPlayed(currentRegion); // Update lastRegionPlayed

          if (currentTime >= currentRegion.end) {
            // Find the index of the current region in the array of regions
            const currentIndex = regions.findIndex(region => region.id === currentRegion.id);
            if (currentIndex !== -1) {
              const nextIndex = (currentIndex + 1) % regions.length; // Calculate the index of the next region
              const nextRegion = regions[nextIndex];
              audioRef.current.currentTime = nextRegion.start; // Reset to the start of the next region
            }
          }
        } else if (lastRegionPlayed) {
          // If not in any region, start from the last played region
          audioRef.current.currentTime = lastRegionPlayed.start;
        } else if (regions.length > 0) {
          audioRef.current.currentTime = regions[0].start; // If no region has been played yet, start from the first region
        }
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audioRef, isLooping, wavesurferRegions, lastRegionPlayed]);

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
    setIsLooping((prevLoop) => !prevLoop);
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

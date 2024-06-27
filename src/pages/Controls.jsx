import React, { useEffect, useState, useCallback } from 'react';
import {
  IoPlayBackSharp,
  IoPlayForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoRepeat,
  IoSpeedometerOutline, // Icon for speed control
  IoSearchSharp, // Icon for zoom control
  IoSaveSharp
} from 'react-icons/io5';
import PropTypes from 'prop-types';
import styled from "styled-components";
import lamejs from 'lamejs';

const Container = styled.section`
  display: flex;
  justify-content: center;
  margin-top: 50px;
  border-radius: 15px;

  button, .ico {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    font-size: 24px;
    display: flex;
    align-items: center;
  }

  .ico {
    padding: 0;
  }

  .speed-control {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }

  .speed-display {
    margin-left: 8px;
    font-size: 18px;
  }

  .zoom-control {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }

  .zoom-range {
    margin-left: 8px;
    width: 100px;
  }
`;

const Controls = React.memo(({ isPlaying, setIsPlaying, audioRef, wavesurferInstance, wavesurferRegions, isLooping, setIsLooping, selectedAudio }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastRegionPlayed, setLastRegionPlayed] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    audioRef.current.playbackRate = playbackSpeed;
    if (wavesurferInstance) {
      wavesurferInstance.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, audioRef, wavesurferInstance]);

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

  const handleControlClick = (val, forward = false) => {
    if (forward) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + val);
    } else {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - val);
    }
  };

  const handleLoopToggle = useCallback(() => {
    setIsLooping((prevLoop) => !prevLoop);
  }, [setIsLooping]);

  const handleZoom = (zoomValue) => {
    setZoomLevel(zoomValue);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(zoomValue);
    }
  };

  const handleSaveClick = async () => {
    if (!wavesurferRegions) return;
  
    const regions = Object.values(wavesurferRegions.getRegions());
    if (regions.length === 0) return;
  
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await fetchAndCombineAudio(selectedAudio, regions, audioContext);
  
      if (!audioBuffer) {
        console.error('No valid audio buffer fetched');
        return;
      }
  
      // Convert combined buffer to MP3
      const mp3Blob = encodeWAVToMP3(audioBuffer, audioContext.sampleRate);
  
      // Create a download link and click it
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'regions_audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching or encoding audio:', error);
    }
  };
  
  const fetchAndCombineAudio = async (audioFile, regions, audioContext) => {
    try {
      const response = await fetch(audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      const audioData = [];
      regions.forEach(region => {
        const start = Math.floor(region.start * audioBuffer.sampleRate);
        const end = Math.min(Math.floor(region.end * audioBuffer.sampleRate), audioBuffer.length);
  
        if (start >= end || end > audioBuffer.length) {
          throw new Error(`Invalid start or end time for region ${region.id}`);
        }
  
        const slicedBuffer = audioBuffer.getChannelData(0).slice(start, end);
        audioData.push(slicedBuffer);
      });
  
      // Combine all sliced audio buffers into one
      const combinedBuffer = Float32Array.from(audioData.flat());
      return combinedBuffer;
    } catch (error) {
      console.error('Error fetching or combining audio:', error);
      return null;
    }
  };
  
  const encodeWAVToMP3 = (samples, sampleRate) => {
    const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // Mono, sample rate, and bit rate
    const maxSamples = 1152;
    const mp3Data = [];
  
    for (let i = 0; i < samples.length; i += maxSamples) {
      const sampleChunk = samples.subarray(i, i + maxSamples);
      const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
    }
  
    const end = mp3Encoder.flush();
    if (end.length > 0) {
      mp3Data.push(new Int8Array(end));
    }
  
    return new Blob(mp3Data, { type: 'audio/mp3' });
  };
  
  
  const handleSpeedToggle = () => {
    setPlaybackSpeed((prevSpeed) => {
      if (prevSpeed === 1) return 1.5;
      if (prevSpeed === 1.5) return 2;
      if (prevSpeed === 2) return 3;
      if (prevSpeed === 3) return 4;
      if (prevSpeed === 4) return 0.75;
      if (prevSpeed === 0.75) return 0.5;
      return 1;
    });
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
      <div className="speed-control">
        <button onClick={handleSpeedToggle}>
          <IoSpeedometerOutline />
        </button>
        <span className="speed-display">{playbackSpeed}x</span>
      </div>
      <div className="zoom-control">
        <IoSearchSharp />
        <input
          type="range"
          min="1"
          max="1200"
          value={zoomLevel * 100}
          onChange={(e) => handleZoom(e.target.value / 1)}
          className="zoom-range"
        />
      </div>
      <button onClick={handleSaveClick}>
        <IoSaveSharp />
      </button>
    </Container>
  );
});

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  audioRef: PropTypes.object.isRequired,
  wavesurferInstance: PropTypes.object,
  wavesurferRegions: PropTypes.object,
  isLooping: PropTypes.bool.isRequired,
  setIsLooping: PropTypes.func.isRequired,
  selectedAudio: PropTypes.mp3Blob // Corrected PropTypes here
};

export default Controls;


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
  IoSaveSharp,
  IoSpeedometerOutline // Icon for speed control
} from 'react-icons/io5';
import PropTypes from 'prop-types';
import styled from "styled-components";
import lamejs from 'lamejs';

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

  ico {
    background: none;
    border: none;
    padding: 10px;
    font-size: 24px;
  }

  .speed-control {
    display: flex;
    align-items: center;
  }

  .speed-display {
    margin-left: 8px;
    font-size: 18px;
  }
`;

const Controls = React.memo(({ isPlaying, setIsPlaying, audioRef, wavesurferInstance, wavesurferRegions, isLooping, setIsLooping }) => {
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
      const audioBuffers = [];
  
      const fetchRegionAudio = async (region) => {
        if (!region.data || !region.data.url) {
          console.warn(`Region ${region.id} does not have a valid URL`);
          return null; // Handle the absence of URL as needed
        }
      
        try {
          console.log(`Fetching audio for region ${region.id} from ${region.data.url}`);
          const response = await fetch(region.data.url);
          if (!response.ok) {
            throw new Error(`Network response was not ok for region ${region.id}: ${response.status}`);
          }
      
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Fetched audio for region ${region.id}: ${arrayBuffer.byteLength} bytes`);
      
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          console.log(`Decoded audio for region ${region.id}`);
      
          const start = Math.floor(region.start * audioBuffer.sampleRate);
          const end = Math.min(Math.floor(region.end * audioBuffer.sampleRate), audioBuffer.length);
      
          if (start >= end || end > audioBuffer.length) {
            throw new Error(`Invalid start or end time for region ${region.id}`);
          }
      
          const slicedBuffer = audioBuffer.getChannelData(0).slice(start, end);
          return slicedBuffer;
        } catch (error) {
          console.error(`Error fetching or decoding audio for region ${region.id}:`, error);
          throw error;
        }
      };
      
      
  
      // Fetch and combine audio for all regions
      for (const region of regions) {
        const regionBuffer = await fetchRegionAudio(region);
        if (regionBuffer) {
          audioBuffers.push(regionBuffer);
        }
      }
  
      if (audioBuffers.length === 0) {
        console.error('No valid audio buffers were fetched');
        return;
      }
  
      // Combine all sliced audio buffers into one
      const combinedBuffer = Float32Array.from(audioBuffers.flat());
  
      // Convert combined buffer to MP3
      const mp3Blob = encodeWAVToMP3(combinedBuffer, audioContext.sampleRate);
  
      // Create a download link and click it
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'regions_audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching region audio:', error);
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
      if (prevSpeed === 0.5) return 0.25;
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
      <ico><IoResize /></ico>

      <input
        type="range"
        min="0"
        max="1200"
        value={zoomLevel}
        onChange={(e) => handleZoom(e.target.valueAsNumber)}
      />
      <button onClick={handleSaveClick}><IoSaveSharp /></button>
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

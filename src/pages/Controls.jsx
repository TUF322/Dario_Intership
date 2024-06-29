import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  IoPlayBackSharp, IoPlayForwardSharp, IoPlaySkipBackSharp, IoPlaySkipForwardSharp,
  IoPlaySharp, IoPauseSharp, IoRepeat, IoSpeedometerOutline, IoSearchSharp, IoSaveSharp
} from 'react-icons/io5';
import PropTypes from 'prop-types';
import Wavesurfer from 'wavesurfer.js';
import decodeAudio from 'audio-decode';
import lamejs from 'lamejs'; // Ensure MPEGMode is imported

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

const Controls = ({
  isPlaying, setIsPlaying, audioRef, wavesurferInstance, wavesurferRegions, isLooping, setIsLooping, selectedAudio
}) => {
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
      return () => audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
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
    setIsLooping(prevLoop => !prevLoop);
  }, [setIsLooping]);

  const handleZoom = (zoomValue) => {
    setZoomLevel(zoomValue);
    if (wavesurferInstance) {
      wavesurferInstance.zoom(zoomValue);
    }
  };

  const handleSaveClick = async () => {
    if (!wavesurferRegions || !selectedAudio) {
      console.error('Selected audio or regions not available');
      return;
    }

    const regions = Object.values(wavesurferRegions.getRegions());
    if (regions.length === 0) {
      console.error('No regions defined');
      return;
    }

    try {
      const audioBuffer = await fetchAudioBuffer(selectedAudio);

      const regionToSave = regions.find(region => region.id === lastRegionPlayed?.id) || regions[0];
      const { start, end, data } = regionToSave;

      const mp3Blob = await encodeBufferToMP3(audioBuffer, start, end);

      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.content}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching or encoding audio:', error);
    }
  };

  const fetchAudioBuffer = async (audioFile) => {
    try {
      const response = await fetch(audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await decodeAudio(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error decoding audio data:', error);
      throw error;
    }
  };

  const encodeBufferToMP3 = async (audioBuffer, startSeconds, endSeconds) => {
    const mp3Encoder = new lamejs.Mp3Encoder(audioBuffer.numberOfChannels, audioBuffer.sampleRate, 128);
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
  
    const startSample = Math.floor(startSeconds * sampleRate);
    const endSample = Math.floor(endSeconds * sampleRate);
  
    const maxSamples = 1152;

    const mp3Data = [];
  
    for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const slicedData = channelData.slice(startSample, endSample);
  
      const samples = new Int16Array(slicedData.length);
      for (let i = 0; i < slicedData.length; i++) {
        samples[i] = Math.max(-1, Math.min(1, slicedData[i])) * 32767;
      }
  
      for (let i = 0; i < samples.length; i += maxSamples) {
        const sampleChunk = samples.subarray(i, i + maxSamples);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(new Int8Array(mp3buf));
        }
      }
    }
  
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }
  
    return new Blob(mp3Data, { type: 'audio/mp3' });
  };

  const handleSpeedToggle = () => {
    setPlaybackSpeed(prevSpeed => {
      if (prevSpeed === 1) return 1.5;
      if (prevSpeed === 1.5) return 2;
      if (prevSpeed === 2) return 0.5;
      return 1;
    });
  };

  return (
    <Container>
      <button onClick={() => handleControlClick(10, false)}>
        <IoPlaySkipBackSharp />
      </button>
      <button onClick={() => handleControlClick(5, false)}>
        <IoPlayBackSharp />
      </button>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
      </button>
      <button onClick={() => handleControlClick(5, true)}>
        <IoPlayForwardSharp />
      </button>
      <button onClick={() => handleControlClick(10, true)}>
        <IoPlaySkipForwardSharp />
      </button>
      <button onClick={handleLoopToggle}>
        <IoRepeat color={isLooping ? 'blue' : 'black'} />
      </button>
      <div className="speed-control">
        <IoSpeedometerOutline className="ico" onClick={handleSpeedToggle} />
        <div className="speed-display">{playbackSpeed}x</div>
      </div>
      <div className="zoom-control">
        <IoSearchSharp className="ico" />
        <input
          type="range"
          min="1"
          max="500"
          value={zoomLevel}
          onChange={(e) => handleZoom(e.target.value)}
          className="zoom-range"
        />
      </div>
      <button onClick={handleSaveClick}>
        <IoSaveSharp />
      </button>
    </Container>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  audioRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  wavesurferInstance: PropTypes.instanceOf(Wavesurfer),
  wavesurferRegions: PropTypes.object,
  isLooping: PropTypes.bool.isRequired,
  setIsLooping: PropTypes.func.isRequired,
  selectedAudio: PropTypes.string // Update to not required
};

export default Controls;

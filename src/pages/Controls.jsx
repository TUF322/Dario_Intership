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
  IoSaveSharp
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

  ico {
    background: none;
    border: none;
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
        try {
          const response = await fetch(region.url);
          if (!response.ok) {
            throw new Error(`Network response was not ok for region ${region.id}: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Fetched audio for region ${region.id}: ${arrayBuffer.byteLength} bytes`);
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const start = Math.floor(region.start * audioBuffer.sampleRate);
          const end = Math.floor(region.end * audioBuffer.sampleRate);
          const slicedBuffer = audioBuffer.slice(start, end);
          audioBuffers.push(slicedBuffer);
        } catch (error) {
          console.error(`Error fetching or decoding audio for region ${region.id}:`, error);
          throw error; // Rethrow the error to be caught by Promise.all
        }
      };
  
      await Promise.all(regions.map(fetchRegionAudio));
  
      const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
      const concatenatedBuffer = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
      let offset = 0;
  
      audioBuffers.forEach(buffer => {
        concatenatedBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
        offset += buffer.length;
      });
  
      const wavData = audioBufferToWav(concatenatedBuffer);
      const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'exported_audio.wav';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching region audio:', error);
    }
  };
  
  // Utility function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer) => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let index = 0;
    let sample;
    let offset = 0;
  
    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
  
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChannels); // avg. bytes/sec
    setUint16(numOfChannels * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)
  
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - offset - 4); // chunk length
  
    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
  
    while (index < buffer.length) {
      for (let i = 0; i < numOfChannels; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][index]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
      index++;
    }
  
    console.log('WAV buffer created:', bufferArray.byteLength, 'bytes');
  
    return bufferArray;
  
    function setUint16(data) {
      view.setUint16(offset, data, true);
      offset += 2;
    }
  
    function setUint32(data) {
      view.setUint32(offset, data, true);
      offset += 4;
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
        <ico><IoResize/></ico>
        
        <input
          type="range"
          min="0"
          max="1200"
          value={zoomLevel}
          onChange={(e) => handleZoom(e.target.valueAsNumber)}
        />
        <button onClick={handleSaveClick}><IoSaveSharp/></button>    
        
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

   

// src/pages/Spectrogram.jsx

import React, { useEffect, useRef, useState } from 'react';
import { initializeWaveformWithRegions } from './Regions';
import Controls from './Controls';
import ProgressBar from './ProgressBar';

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const { ws } = initializeWaveformWithRegions(audioRef.current.src, waveformRef.current, true);
    setWavesurferInstance(ws);

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    // Event listeners for play, pause, and seek
    audioRef.current.onplay = () => ws.play();
    audioRef.current.onpause = () => ws.pause();
    audioRef.current.onseeked = () => ws.seekTo(audioRef.current.currentTime / audioRef.current.duration);

    return () => {
      ws.destroy();
    };
  }, [audioRef]);

  return (
    <div>
      <div ref={waveformRef} style={{ width: '95vw', height: '128px' }}></div>
      <ProgressBar currentTime={currentTime} duration={duration} audioRef={audioRef} />
      <Controls
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioRef={audioRef}
        wavesurferInstance={wavesurferInstance}
      />
    </div>
  );
};

export default SpectrogramComponent;

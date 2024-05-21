// src/pages/Spectrogram.jsx

import React, { useEffect, useRef } from 'react';
import { initializeWaveformWithRegions } from './Regions';

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  let wavesurferInstance = null;

  useEffect(() => {
    const { ws, wsRegions } = initializeWaveformWithRegions(audioRef.current.src, waveformRef.current, true);
    wavesurferInstance = ws;

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
      <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>
    </div>
  );
};

export default SpectrogramComponent;

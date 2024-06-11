import React, { useEffect, useRef, useState } from 'react';
import { initializeWaveformWithRegions } from '../Regions';

const Waveform = ({ audioRef, selectedAudio, onReady, onCurrentTimeChange, onDurationChange, onRegionsChange }) => {
  const waveformRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);

  useEffect(() => {
    const { ws, wsRegions } = initializeWaveformWithRegions(selectedAudio, waveformRef.current, true);
    setWavesurferInstance(ws);
    setWavesurferRegions(wsRegions);

    ws.on('audioprocess', () => {
      onCurrentTimeChange(ws.getCurrentTime());
    });

    ws.on('ready', () => {
      onDurationChange(ws.getDuration());
      onReady(ws);
      onRegionsChange(wsRegions);
    });

    ws.on('seek', (newTime) => {
      onCurrentTimeChange(newTime * ws.getDuration());
    });

    audioRef.current.onplay = () => ws.play();
    audioRef.current.onpause = () => ws.pause();
    audioRef.current.onseeked = () => ws.seekTo(audioRef.current.currentTime / audioRef.current.duration);

    return () => {
      ws.destroy();
    };
  }, [audioRef, selectedAudio]);

  return <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>;
};

export default Waveform;

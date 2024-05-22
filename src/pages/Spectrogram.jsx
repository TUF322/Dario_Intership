import React, { useEffect, useRef, useState } from 'react';
import { initializeWaveformWithRegions } from './Regions';
import Controls from './Controls';
import ProgressBar from './ProgressBar';

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const { ws, wsRegions } = initializeWaveformWithRegions(audioRef.current.src, waveformRef.current, true);
    setWavesurferInstance(ws);
    setWavesurferRegions(wsRegions);

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

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
      <ProgressBar currentTime={currentTime} duration={duration} audioRef={audioRef} />
      <Controls
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioRef={audioRef}
        wavesurferInstance={wavesurferInstance}
        wavesurferRegions={wavesurferRegions}
        isLooping={isLooping}
        setIsLooping={setIsLooping}
      />
    </div>
  );
};

export default SpectrogramComponent;

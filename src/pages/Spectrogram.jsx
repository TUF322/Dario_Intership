import React, { useEffect, useRef, useState } from 'react';
import { initializeWaveformWithRegions } from './Regions';
import Controls from './Controls';
import ProgressBar from './ProgressBar';

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  const canvasRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const canvasWidth = 1600; // Set the width of the canvas
  const canvasHeight = 200; // Set the height of the canvas
  const backgroundColor = '#ddd'; // Set the background color to white
  const textColor = 'black'; // Set the text color to black

  useEffect(() => {
    const { ws, wsRegions } = initializeWaveformWithRegions(audioRef.current.src, waveformRef.current, true);
    setWavesurferInstance(ws);
    setWavesurferRegions(wsRegions);

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setupAudioAnalysis();
    });

    audioRef.current.onplay = () => ws.play();
    audioRef.current.onpause = () => ws.pause();
    audioRef.current.onseeked = () => ws.seekTo(audioRef.current.currentTime / audioRef.current.duration);

    return () => {
      ws.destroy();
    };
  }, [audioRef]);

  const setupAudioAnalysis = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const drawSpectrogram = () => {
      requestAnimationFrame(drawSpectrogram);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      // Draw frequency scale
      drawFrequencyScale(canvasCtx, canvas.height, bufferLength, audioContext.sampleRate);
    };

    drawSpectrogram();
  };

  const drawFrequencyScale = (canvasCtx, canvasHeight, bufferLength, sampleRate) => {
    const nyquist = sampleRate / 2;
    const step = canvasHeight / bufferLength;
    const stepFrequency = nyquist / (bufferLength / 2);

    canvasCtx.fillStyle = textColor;
    canvasCtx.font = '12px Arial';
    for (let i = 0; i <= bufferLength / 2; i++) {
      const frequency = stepFrequency * i;
      if (frequency % 1000 === 0) {
        const y = canvasHeight - i * step;
        canvasCtx.fillText((frequency / 1000).toFixed(1) + ' kHz', 10, y);
      }
    }
  };

  return (
    <div>
      <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className='audio-analizer'></canvas>
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

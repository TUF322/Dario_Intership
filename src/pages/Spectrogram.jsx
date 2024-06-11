import React, { useEffect, useRef, useState } from 'react';
import { initializeWaveformWithRegions } from './Regions';
import Controls from './Controls';
import RMenu from './RMenu';
import ProgressBar from './ProgressBar';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import WavesurferPlayer from '@wavesurfer/react'

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  const canvasRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [wavesurfer, setWavesurfer] = useState(null)

  const [duration, setDuration] = useState(0);

  const canvasWidth = 1600;
  const canvasHeight = 200;
  const backgroundColor = '#ddd';
  const textColor = 'black';
  const marginLeft = 60;
  const threshold = 10; // Define an appropriate threshold

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

      const maxChange = Math.max(...dataArray) - Math.min(...dataArray);
      if (maxChange < threshold) {
        return;
      }

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width - marginLeft) / bufferLength;
      let barHeight;
      let x = marginLeft;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = `rgb(${barHeight + 100},0,255)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      drawFrequencyScale(canvasCtx, canvas.height, bufferLength, audioContext.sampleRate);
    };

    drawSpectrogram();
  };

  const drawFrequencyScale = (canvasCtx, canvasHeight, bufferLength, sampleRate) => {
    const nyquist = sampleRate / 2;
    const stepFrequency = nyquist / bufferLength;

    canvasCtx.fillStyle = textColor;
    canvasCtx.font = '12px Arial';

    for (let i = 0; i <= bufferLength; i++) {
      const frequency = stepFrequency * i;
      const frequencyInKHz = (frequency / 1000).toFixed(1);
      if (frequency % 1000 === 0 && ![21.0, 18.0].includes(parseFloat(frequencyInKHz))) {
        const y = canvasHeight - ((frequency / nyquist) * canvasHeight);
        canvasCtx.fillText(`${frequencyInKHz} kHz`, 10, y);
      }
    }
  };

  const addRegion = (regionName) => {
    if (wavesurferRegions) {
      const existingRegion = wavesurferRegions.getRegions().find(region => region.data && region.data.content === regionName);
      if (existingRegion) {
        console.log(`Region with name "${regionName}" already exists.`);
        return;
      }

      const start = wavesurferInstance.getCurrentTime();
      const end = start + 10;
      const region = wavesurferRegions.addRegion({
        start,
        end,
        data: {},
        color: 'rgba(0, 255, 0, 0.3)',
        content: regionName
      });

      region.data = { ...region.data, content: regionName };

      console.log('Region added:', region);
      console.log('Region content:', region.data ? region.data.content : 'No content');
    }
  };

  const deleteRegion = (regionName) => {
    if (wavesurferRegions) {
      const regions = wavesurferRegions.getRegions();
      console.log('Current regions:', regions);
      let regionFound = false;
      for (const regionId in regions) {
        const region = regions[regionId];
        console.log('Checking region:', region);
        console.log('Region data:', region.data);

        if (region.data && region.data.content === regionName) {
          console.log('Deleting region:', region);
          region.remove();
          regionFound = true;
          break;
        }
      }
      if (!regionFound) {
        console.log(`Region with name "${regionName}" not found.`);
      }
      console.log('Regions after deletion attempt:', wavesurferRegions.getRegions());
    }
  };

  const onReady = (ws) => {
    setWavesurfer(ws)
    setIsPlaying(false)
  }


  return (
    <div>
      <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>
      <WavesurferPlayer
        ref={canvasRef}
        height={100}
        waveColor="violet"
        url={audioRef}
        onReady={onReady}
        className='audio-analyzer'
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ marginTop: '25px', width: '96vw' }}
      />
      <canvas className="canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight}  style={{ marginTop: '25px', width: '90vw' }}></canvas>
      <RMenu addRegion={addRegion} deleteRegion={deleteRegion} />
      <ProgressBar currentTime={currentTime} duration={duration} audioRef={audioRef} />
      {wavesurferInstance && wavesurferRegions && (
        <Controls
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
          wavesurferInstance={wavesurferInstance}
          wavesurferRegions={wavesurferRegions}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
        />
      )}
    </div>
  );
};

export default SpectrogramComponent;

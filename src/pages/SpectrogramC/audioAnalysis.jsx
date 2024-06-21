import React, { useEffect } from 'react';

const AudioAnalysis = ({ canvasRef, audioRef }) => {
  const canvasWidth = 1600;
  const canvasHeight = 200;
  const backgroundColor = '#ddd';
  const textColor = 'black';
  const marginLeft = 60;
  const threshold = 10;

  useEffect(() => {
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

    const drawFrequencyScale = (canvasCtx, canvasWidth, sampleRate) => {
      const nyquist = sampleRate / 2;
      const binWidth = nyquist / bufferLength;

      canvasCtx.fillStyle = textColor;
      canvasCtx.font = '12px Arial';

      for (let i = 0; i <= nyquist; i += 5000) {
        const x = marginLeft + (i / nyquist) * (canvasWidth - marginLeft);
        canvasCtx.fillText(`${(i / 1000).toFixed(0)} kHz`, x, canvasHeight - 10);
      }
    };

    const drawSpectrogram = () => {
      requestAnimationFrame(drawSpectrogram);
      analyser.getByteFrequencyData(dataArray);

      const maxIntensity = Math.max(...dataArray);
      const minIntensity = Math.min(...dataArray);
      const intensityRange = maxIntensity - minIntensity;

      if (intensityRange < threshold) {
        return;
      }

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width - marginLeft) / bufferLength;
      let x = marginLeft;

      for (let i = 0; i < bufferLength; i++) {
        const normalizedValue = (dataArray[i] - minIntensity) / intensityRange;
        const barHeight = normalizedValue * canvasHeight;

        canvasCtx.fillStyle = `rgb(${Math.floor((dataArray[i] / 255) * 255)}, 0, 255)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth;
      }

      drawFrequencyScale(canvasCtx, canvas.width, audioContext.sampleRate);

      // Calculate and log peak frequency and current time
      const nyquist = audioContext.sampleRate / 2;
      const binWidth = nyquist / bufferLength;
      const peakIndex = dataArray.indexOf(Math.max(...dataArray));
      const peakFrequency = (peakIndex * binWidth) / 1000;
      const currentTime = audioRef.current.currentTime.toFixed(2);
      console.log(`Current Time: ${currentTime} s, Peak Frequency: ${peakFrequency.toFixed(1)} kHz`);
    };

    drawSpectrogram();

    return () => {
      source.disconnect();
      audioContext.close();
    };
  }, [audioRef, canvasRef]);

  return null;
};

export default AudioAnalysis;

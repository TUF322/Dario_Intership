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

    const drawFrequencyScale = (canvasCtx, canvasHeight, bufferLength, sampleRate) => {
      const nyquist = sampleRate / 2;
      const stepFrequency = nyquist / bufferLength;

      canvasCtx.fillStyle = textColor;
      canvasCtx.font = '12px Arial';

      for (let i = 0; i <= bufferLength; i += 32) { // Adjusted step for readability
        const frequency = stepFrequency * i;
        const frequencyInKHz = (frequency / 1000).toFixed(1);
        if (frequency % 1000 === 0) {
          const y = canvasHeight - ((frequency / nyquist) * canvasHeight);
          canvasCtx.fillText(`${frequencyInKHz} kHz`, 10, y);
        }
      }
    };

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
      let x = marginLeft;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 0, 255)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      drawFrequencyScale(canvasCtx, canvas.height, bufferLength, audioContext.sampleRate);
    };

    drawSpectrogram();

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const nyquist = audioContext.sampleRate / 2;
      const binWidth = nyquist / bufferLength;
      const peakIndex = dataArray.indexOf(Math.max(...dataArray));
      const peakFrequency = peakIndex * binWidth / 1000;
      console.log(`Peak frequency: ${peakFrequency.toFixed(1)} kHz`);
    }, 1000);

    return () => {
      clearInterval(interval);
      source.disconnect();
      audioContext.close();
    };
  }, [audioRef, canvasRef]);

  return null;
};

export default AudioAnalysis;

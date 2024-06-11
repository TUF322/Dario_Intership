import React, { useEffect, useRef } from 'react';

const SpectrogramCanvas = ({ audioRef }) => {
  const canvasRef = useRef(null);
  const canvasWidth = 1600;
  const canvasHeight = 200;
  const backgroundColor = '#ddd';
  const textColor = 'black';
  const marginLeft = 60;
  const threshold = 10; // Define an appropriate threshold

  useEffect(() => {
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

    setupAudioAnalysis();
  }, [audioRef]);

  return (
    <canvas
      className="canvas"
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ marginTop: '25px', width: '90vw' }}
    ></canvas>
  );
};

export default SpectrogramCanvas;

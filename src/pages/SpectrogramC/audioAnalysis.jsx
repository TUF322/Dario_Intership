import React, { useEffect } from 'react';

const AudioAnalysis = ({ canvasRef, audioRef }) => {
  const canvasWidth = 1600;
  const canvasHeight = 200;
  const backgroundColor = '#ddd';
  const textColor = 'black';
  const marginLeft = 60;
  const threshold = 10;

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

        // Get current time of the audio element
        const currentTime = audioRef.current.currentTime;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          canvasCtx.fillStyle = `rgb(${barHeight + 100},0,255)`;
          canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

          // Calculate frequency in kHz
          const frequency = i * (audioContext.sampleRate / 2) / bufferLength / 1000;
          const frequencyTimeLog = {
            time: currentTime,
            frequency: frequency.toFixed(1)
          };

          console.log(frequencyTimeLog);

          x += barWidth + 1;
        }

        drawFrequencyScale(canvasCtx, canvas.height, bufferLength, audioContext.sampleRate);
      };

      drawSpectrogram();
    };

    setupAudioAnalysis();
  }, [audioRef, canvasRef]);

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

  return null;
};

export default AudioAnalysis;

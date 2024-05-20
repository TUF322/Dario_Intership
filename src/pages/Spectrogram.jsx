import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'; // Import Spectrogram plugin separately

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  const spectrogramRef = useRef(null);
  let wavesurfer = null;

  useEffect(() => {
    // Initialize WaveSurfer instance
    wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: '#333',
      plugins: [
        Spectrogram.create({
          container: spectrogramRef.current,
          labels: true,
        }),
      ],
    });

    // Load audio source
    wavesurfer.load(audioRef.current.src);

    // Event listeners for play, pause, and seek
    audioRef.current.onplay = () => wavesurfer.play();
    audioRef.current.onpause = () => wavesurfer.pause();
    audioRef.current.onseeked = () => wavesurfer.seekTo(audioRef.current.currentTime / audioRef.current.duration);

    // Cleanup function
    return () => {
      wavesurfer.destroy();
    };
  }, [audioRef]);

  return (
    <div>
      <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>
      <div ref={spectrogramRef} style={{ width: '100%', height: '256px' }}></div>
    </div>
  );
};

export default SpectrogramComponent;

import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'; // Import Regions plugin

const SpectrogramComponent = ({ audioRef }) => {
  const waveformRef = useRef(null);
  let wavesurfer = null;

  useEffect(() => {
    // Initialize WaveSurfer instance with Regions plugin
    wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: '#333',
      plugins: [
        RegionsPlugin.create(),
      ],
      interact: false, // Disable audio interaction
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
    </div>
  );
};

export default SpectrogramComponent;

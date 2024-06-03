import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js';

// Utility functions
const random = (min, max) => Math.random() * (min - max) + min;
const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

const initializeWaveformWithRegions = (audioUrl, container, loop) => {
  const ws = WaveSurfer.create({
    container,
    waveColor: 'rgb(75, 75, 180)',
    progressColor: '#0000fe',
    url: audioUrl,
    plugins: [
      TimelinePlugin.create(),
      ZoomPlugin.create() // Removed initial zoom configuration
    ],
    minPxPerSec: 100,
    responsive: true, // Added for responsive rendering
    backend: 'MediaElement' // Using MediaElement for better performance
  });

  const wsRegions = ws.registerPlugin(RegionsPlugin.create());

  ws.on('ready', () => {
    // Enable drag selection
    wsRegions.enableDragSelection({
      color: 'rgba(255, 0, 0, 0.1)',
    });
    // Set initial zoom level
    ws.zoom(1);
  });

  // Show the current minPxPerSec value
  const minPxPerSecSpan = document.querySelector('#minPxPerSec');
  const updateMinPxPerSec = (minPxPerSec) => {
    if (minPxPerSecSpan) {
      minPxPerSecSpan.textContent = `${Math.round(minPxPerSec)}`;
    }
    console.log('Zoom level changed: ', minPxPerSec);
  };

  ws.on('zoom', updateMinPxPerSec);

  let activeRegion = null;

  // Event handlers for region interactions
  wsRegions.on('region-in', (region) => {
    console.log('region-in', region);
    activeRegion = region;
  });

  wsRegions.on('region-out', (region) => {
    console.log('region-out', region);
    if (activeRegion === region) {
      activeRegion = null;
      if (loop) {
        ws.play(region.start);
      }
    }
  });

  wsRegions.on('region-clicked', (region, e) => {
    e.stopPropagation();
    activeRegion = region;
    region.play();
    region.setOptions({ color: randomColor() });
  });

  // Reset activeRegion when interacting with the waveform
  ws.on('interaction', () => {
    activeRegion = null;
  });

  ws.on('decodeerror', () => {
    console.error('Error decoding audio file');
  });

  return { ws, wsRegions };
};

export { initializeWaveformWithRegions };

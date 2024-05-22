// src/pages/Regions.js

import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'

// Utility functions
const random = (min, max) => Math.random() * (min - max) + min;
const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

const initializeWaveformWithRegions = (audioUrl, container, loop) => {
  const ws = WaveSurfer.create({
    container,
    waveColor: 'rgb(75, 75, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: audioUrl,
    plugins: [TimelinePlugin.create()],
  });

  const wsRegions = ws.registerPlugin(RegionsPlugin.create());

  ws.on('ready', () => {
    // Add regions
    wsRegions.addRegion({
      start: 0.5,
      end: 8,
      content: 'Start',
      color: randomColor(),
      drag: true,
      resize: true,
    });
    wsRegions.addRegion({
      start: 9,
      end: 10,
      content: 'Cramped region',
      color: randomColor(),
      minLength: 1,
      maxLength: 10,
    });
    wsRegions.addRegion({
      start: 12,
      end: 17,
      content: 'Drag me',
      color: randomColor(),
      resize: false,
      
    });
    wsRegions.addRegion({
      start: 19,
      content: 'Marker',
      color: randomColor(),
    });
    wsRegions.addRegion({
      start: 20,
      content: 'Second marker',
      color: randomColor(),
    });

    // Enable drag selection
    wsRegions.enableDragSelection({
      color: 'rgba(255, 0, 0, 0.1)',
    });
  });

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

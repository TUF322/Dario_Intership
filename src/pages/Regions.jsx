import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const random = (min, max) => Math.random() * (min - max) + min;
const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

const initializeWaveformWithRegions = (audioUrl, container, loop) => {
  const ws = WaveSurfer.create({
    container,
    waveColor: 'rgb(75, 75, 200)',
    progressColor: '#0000fe',
    url: audioUrl,
    // minPxPerSec: 100,  // Set initial zoom level
    backend: 'WebAudio',
    plugins: [
      RegionsPlugin.create(),
      TimelinePlugin.create({
        container: '#wave-timeline'
      })
    ],
  });

  const wsRegions = ws.registerPlugin(RegionsPlugin.create());

  ws.on('ready', () => {
    wsRegions.enableDragSelection({
      color: 'rgba(255, 0, 0, 0.1)',
    });
  });

  let activeRegion = null;

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

  ws.on('interaction', () => {
    activeRegion = null;
  });

  ws.on('decodeerror', () => {
    console.error('Error decoding audio file');
  });

  return { ws, wsRegions };
};

export { initializeWaveformWithRegions };

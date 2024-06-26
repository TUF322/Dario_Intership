import { initializeWaveformWithRegions } from '../Regions';

const WaveformSetup = (selectedAudio, waveformContainer, setWavesurferInstance, setWavesurferRegions, audioRef, setCurrentTime, setDuration) => {
  const { ws, wsRegions } = initializeWaveformWithRegions(selectedAudio, waveformContainer, false); // Ensure autoplay is false
  setWavesurferInstance(ws);
  setWavesurferRegions(wsRegions);

  ws.on('audioprocess', () => {
    setCurrentTime(ws.getCurrentTime());
  });

  ws.on('ready', () => {
    setDuration(ws.getDuration());
    // Ensure audio does not play on load
  });

  ws.on('seek', (newTime) => {
    setCurrentTime(newTime * ws.getDuration());
  });

  audioRef.current.onplay = () => ws.play();
  audioRef.current.onpause = () => ws.pause();
  audioRef.current.onseeked = () => ws.seekTo(audioRef.current.currentTime / audioRef.current.duration);

  return { ws, wsRegions };
};

export default WaveformSetup;

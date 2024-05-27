import React, { useRef, useState, useEffect } from 'react';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import srcaudio from './AudioPlayerC/whale.mp3';
import SpectrogramComponent from './Spectrogram'; // Update import if needed
import '../index.css';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateCurrentTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateCurrentTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);

      return () => {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
      };
    }
  }, [audioRef]);

  return (
    <div>
      <div className='spectrogram-card'>
        <SpectrogramComponent audioRef={audioRef} />
      </div>
      <audio ref={audioRef} src={srcaudio}></audio>
    </div>
  );
};

export default AudioPlayer;

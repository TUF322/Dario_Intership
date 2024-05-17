import React, { useRef, useState, useEffect } from 'react';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import srcaudio from './AudioPlayerC/whale.mp3';
import '../index.css';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateCurrentTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateCurrentTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateCurrentTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={srcaudio}></audio>
      <div className="inner">
        <Controls audioRef={audioRef} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        <ProgressBar currentTime={currentTime} duration={duration} audioRef={audioRef} />
      </div>
    </div>
  );
};

export default AudioPlayer;

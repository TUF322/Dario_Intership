//AudioPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import srcaudio from './AudioPlayerC/test.mp3';
import Spectrogram from './Spectrogram';
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

  return (
    <div >
       <div className="spectrogram-container">
        <div className='spectrogram-card'><Spectrogram audioRef={audioRef} /></div>
    
      </div>
      <div className="inner">
     
     
      <audio ref={audioRef} src={srcaudio}></audio>
      </div>
    </div>
  );
};

export default AudioPlayer;

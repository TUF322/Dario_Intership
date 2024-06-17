import React, { useRef, useState, useEffect } from 'react';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import srcaudio from './AudioPlayerC/whale.mp3';
import srcaudio2 from './AudioPlayerC/test.mp3';
import srcaudio3 from './AudioPlayerC/music.mp3';
import SpectrogramComponent from './Spectrogram'; // Update import if needed
import DropFile from './dropfilepage';
import '../index.css';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState(srcaudio);
  const [uploadedAudio, setUploadedAudio] = useState(null);

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

  const handleAudioChange = (event) => {
    setUploadedAudio(null);
    setSelectedAudio(event.target.value);
    audioRef.current.load(); // Reload the audio element to reflect the change
  };

  const handleFileUpload = (file) => {
    setUploadedAudio(URL.createObjectURL(file));
    setSelectedAudio(null);
    audioRef.current.load();
  };

  return (
    <div>
      <DropFile onFileUpload={handleFileUpload} />
      <div>
        <label htmlFor="audio-select">Select Audio:</label>
        <select id="audio-select" onChange={handleAudioChange} value={selectedAudio || ''}>
          <option value={srcaudio}>Whale</option>
          <option value={srcaudio2}>Test</option>
          <option value={srcaudio3}>Music</option>
        </select>
      </div>
      <div className='spectrogram-card'>
        <SpectrogramComponent audioRef={audioRef} selectedAudio={selectedAudio} />
      </div>
      <audio ref={audioRef} src={uploadedAudio || selectedAudio}></audio>
    </div>
  );
};

export default React.memo(AudioPlayer);

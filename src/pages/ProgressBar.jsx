import React, { useCallback } from 'react';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const ProgressBar = ({ currentTime, duration, audioRef }) => {
  const progressPercentage = (currentTime / duration) * 100;

  const handleProgressClick = useCallback((e) => {
    const progress = e.currentTarget;
    const rect = progress.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
  }, [duration, audioRef]);

  return (
    <div className="progress-container">
      <div className="progress-time">{formatTime(currentTime)}</div>
      <div className="progress-bar" onClick={handleProgressClick}>
        <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#a44612' }}></div>
      </div>
      <div className="progress-time">{formatTime(duration)}</div>
    </div>
  );
};

export default ProgressBar;

import React from 'react';
import '../index.css'

const ProgressBar = ({ currentTime, duration, audioRef }) => {
  const progressPercentage = (currentTime / duration) * 100;

  const handleProgressClick = (e) => {
    const progress = e.target;
    const newTime = (e.clientX - progress.offsetLeft) / progress.offsetWidth * duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="progress-bar" onClick={handleProgressClick} style={{ position: 'relative', width: '100%', height: '10px', backgroundColor: '#ddd' }}>
      <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#ff0000' }}></div>
    </div>
  );
};

export default ProgressBar;

import React, { useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Bar = styled.div`
  flex: 1;
  height: 10px;
  background-color: #ccc;
  cursor: pointer;
  position: relative;
`;

const Time = styled.span`
  margin: 0 10px;
`;

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
    <Container>
      <Time>{formatTime(currentTime)}</Time>
      <Bar onClick={handleProgressClick}>
        <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#a44612' }}></div>
      </Bar>
      <Time>{formatTime(duration)}</Time>
    </Container>
  );
};

export default ProgressBar;

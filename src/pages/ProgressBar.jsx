import React, { useCallback, useState, useEffect } from 'react';
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

const Progress = styled.div`
  height: 100%;
  background-color: #a44612;
`;

const Time = styled.span`
  margin: 0 10px;
`;

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const ProgressBar = ({ currentTime, duration, audioRef, wavesurferInstance }) => {
  const [progressPercentage, setProgressPercentage] = useState((currentTime / duration) * 100);

  useEffect(() => {
    setProgressPercentage((currentTime / duration) * 100);
  }, [currentTime, duration]);

  const handleProgressClick = useCallback((e) => {
    const progress = e.currentTarget;
    const rect = progress.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPercentage = (offsetX / rect.width) * 100;
    const newTime = (newPercentage / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgressPercentage(newPercentage);
  }, [duration, audioRef]);

  return (
    <Container>
      <Time>{formatTime(currentTime)}</Time>
      <Bar onClick={handleProgressClick}>
        <Progress style={{ width: `${progressPercentage}%` }} />
      </Bar>
      <Time>{formatTime(duration)}</Time>
    </Container>
  );
};

export default ProgressBar;

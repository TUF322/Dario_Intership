import React, { useCallback } from 'react';
import styled from "styled-components";

const Bar = styled.div`
  cursor: pointer;
  position: relative;
  flex-grow: 1;
  height: 10px;
  background-color: #ddd;
  margin: 0 10px;
  overflow: hidden;

  div {
    height: 100%;
    background-color: #000;
    transition: width 0.1s ease;
  }
`;

const Container = styled.section`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 50px;
  border-radius: 15px;
`;

const Time = styled.div`
  font-size: 14px;
  width: 40px;
  text-align: center;
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

import React, { useState, useRef } from 'react';
import DropFile from './dropfilepage'; 
import SpectrogramComponent from './Spectrogram'; 
import styled from 'styled-components';

const SpecCard = styled.div`
  padding-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 15px;
  margin-top: 20px;
  width: 90vw;
`;

const App = () => {
  const audioRef = useRef(new Audio()); 
  const [selectedAudio, setSelectedAudio] = useState(null);

  const handleFileUpload = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setSelectedAudio(fileUrl);
    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.load(); 
    }
  };

  return (
    <div>
      <DropFile onFileUpload={handleFileUpload} />
      <SpecCard >
        <SpectrogramComponent audioRef={audioRef} selectedAudio={selectedAudio} />
      </SpecCard>
    </div>
  );
};

export default App;

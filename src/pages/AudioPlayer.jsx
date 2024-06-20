import React, { useState, useRef } from 'react';
import DropFile from './dropfilepage'; // Adjust the import path as necessary
import SpectrogramComponent from './Spectrogram'; // Adjust the import path as necessary
import styled from 'styled-components';

const SpecCard = styled.div`
  // Your styles here, if any
`;

const App = () => {
  const audioRef = useRef(null);
  const [selectedAudio, setSelectedAudio] = useState(null);

  const handleFileUpload = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setSelectedAudio(fileUrl);
    if (audioRef.current) {
      audioRef.current.src = fileUrl;
    }
  };

  return (
    <div>
      <DropFile onFileUpload={handleFileUpload} />
      <SpecCard className='spectrogram-card'>
        <SpectrogramComponent audioRef={audioRef} selectedAudio={selectedAudio} />
      </SpecCard>
      <audio ref={audioRef} controls style={{ display: 'none' }} />
    </div>
  );
};

export default App;

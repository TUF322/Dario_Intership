import React, { useState, useRef } from 'react';
import DropFile from './dropfilepage'; // Adjust the import path as necessary
import SpectrogramComponent from './Spectrogram'; // Adjust the import path as necessary
import styled from 'styled-components';

const SpecCard = styled.div`
  // Your styles here, if any
`;

const App = () => {
  const audioRef = useRef(new Audio()); // Create an audio object
  const [selectedAudio, setSelectedAudio] = useState(null);

  const handleFileUpload = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setSelectedAudio(fileUrl);
    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.load(); // Ensure the audio object reloads the new source
    }
  };

  return (
    <div>
      <DropFile onFileUpload={handleFileUpload} />
      <SpecCard className='spectrogram-card'>
        <SpectrogramComponent audioRef={audioRef} selectedAudio={selectedAudio} />
      </SpecCard>
    </div>
  );
};

export default App;

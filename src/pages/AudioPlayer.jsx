import React, { useState, useRef, useEffect } from 'react';
import SpectrogramComponent from './Spectrogram';

const App = () => {
  const audioRef = useRef(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);

  const handleFileDrop = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSelectedAudio(fileUrl);
      audioRef.current.src = fileUrl;
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileDrop} />
      <div className='spectrogram-card'>
      <SpectrogramComponent audioRef={audioRef} selectedAudio={selectedAudio} />
      </div>
      
      <audio ref={audioRef} src={uploadedAudio || selectedAudio} controls style={{opacity:'0'}}></audio>
    </div>
  );
};

export default App;

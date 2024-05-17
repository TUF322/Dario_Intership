import React, { useRef } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import AudioPlayer from './pages/AudioPlayer';

const App = () => {
  const audioRef = useRef(null); // Create a ref for the audio element

  return (
    <Routes>
      <Route 
        path="/" 
        element={<AudioPlayer audioRef={audioRef} />} // Pass the audioRef prop
      />
    </Routes>
  );
}

export default App;

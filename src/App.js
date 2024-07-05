import React, { useRef } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import AudioPlayer from './pages/AudioPlayer';
import Dropfile from './pages/dropfilepage'


const App = () => {
  const audioRef = useRef(null); 

  return (
    <Routes>
      <Route 
        path="/" 
        element={<AudioPlayer audioRef={audioRef} />} 
      />
      <Route 
        path="/dropfile" 
        element={<Dropfile audioRef={audioRef} />} 
      />
    </Routes>
  );
}

export default App;

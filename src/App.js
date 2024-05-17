import React from 'react';
import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';

import AudioPlayer from './pages/AudioPlayer';



const App = () => {
  return (
    
      <Routes>
        <Route path="/" element={<AudioPlayer />} />
      

        {/* Other routes */}
      </Routes>
    
  );

}


export default App;
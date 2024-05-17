import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

import App from './App'; // Importing the main component with routes
import './index.css';
//back color
document.body.style.backgroundColor = '#100c0c';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App /> {/* Render the main component with routes */}
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);


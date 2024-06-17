import React, { useState } from 'react';
import styled from 'styled-components';

const DropFileArea = styled.div`
  border: 2px dashed #cccccc;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin: 20px;
  cursor: pointer;

  &.active {
    border-color: #0000ff;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: #666666;
  }

  input[type='file'] {
    display: none;
  }
`;

const DropFile = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'audio/mpeg' && file.size <= 200 * 1024 * 1024) {
        onFileUpload(file);
      } else {
        alert('Please upload an MP3 file under 200 MB.');
      }
    }
  };

  return (
    <DropFileArea
      className={dragActive ? 'active' : ''}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <p>Drag & Drop your MP3 file here, or click to select a file</p>
      <input
        type="file"
        id="fileElem"
        accept="audio/mpeg"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && file.type === 'audio/mpeg' && file.size <= 200 * 1024 * 1024) {
            onFileUpload(file);
          } else {
            alert('Please upload an MP3 file under 200 MB.');
          }
        }}
      />
    </DropFileArea>
  );
};

export default DropFile;

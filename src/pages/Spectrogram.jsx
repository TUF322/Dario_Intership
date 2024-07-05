import React, { useEffect, useRef, useState } from 'react';
import WaveformSetup from './SpectrogramC/Waveform';
import AudioAnalysis from './SpectrogramC/audioAnalysis';
import Controls from './Controls';
import RMenu from './RMenu';
import ProgressBar from './ProgressBar';

const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () => `rgba(${random(1, 255)}, ${random(1, 255)}, ${random(1, 255)}, 0.5)`;

const SpectrogramComponent = ({ audioRef, selectedAudio }) => {
  const waveformRef = useRef(null);
  const canvasRef = useRef(null);
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const regionColors = useRef({});

  useEffect(() => {
    if (waveformRef.current) {
      const { ws, wsRegions } = WaveformSetup(
        selectedAudio,
        waveformRef.current,
        setWavesurferInstance,
        setWavesurferRegions,
        audioRef,
        setCurrentTime,
        setDuration
      );

      return () => {
        if (ws) {
          ws.destroy();
        }
      };
    }
  }, [audioRef, selectedAudio]);

  const addRegion = (regionName) => {
    if (wavesurferRegions) {
      const regions = wavesurferRegions.getRegions();
      const similarRegions = Object.values(regions).filter(region => region.data && region.data.content.startsWith(regionName));
      const newRegionName = `${regionName} ${similarRegions.length + 1}`;
      const color = regionColors.current[regionName] || randomColor();
  
      if (!regionColors.current[regionName]) {
        regionColors.current[regionName] = color;
      }
  
      const start = wavesurferInstance.getCurrentTime();
      const end = start + 10; 
  
      const region = wavesurferRegions.addRegion({
        start,
        end,
        color,
        content: newRegionName
      });
  
      region.data = { content: newRegionName }; 
  
      console.log('Region added:', region);
      console.log('Region content:', region.data ? region.data.content : 'No content');
    }
  };
  

  const deleteRegion = (regionName) => {
    if (wavesurferRegions) {
      const regions = wavesurferRegions.getRegions();
      let regionFound = false;

      for (const regionId in regions) {
        const region = regions[regionId];
        if (region.data && region.data.content === regionName) {
          region.remove();
          regionFound = true;
          break;
        }
      }

      if (!regionFound) {
        console.log(`Region with name "${regionName}" not found.`);
      }

      console.log('Regions after deletion attempt:', wavesurferRegions.getRegions());
    }
  };

  return (
    <div>
      <div ref={waveformRef} style={{ width: '100%', height: '128px' }}></div>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={1600}
        height={200}
        style={{ marginTop: '25px', width: '90vw' }}
      ></canvas>
      <RMenu addRegion={addRegion} deleteRegion={deleteRegion} />
      <ProgressBar currentTime={currentTime} duration={duration} audioRef={audioRef} />
      {wavesurferInstance && wavesurferRegions && (
        <Controls
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
          wavesurferInstance={wavesurferInstance}
          wavesurferRegions={wavesurferRegions}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          selectedAudio={selectedAudio}
        />
      )}
      <AudioAnalysis canvasRef={canvasRef} audioRef={audioRef} /> 
    </div>
  );
};

export default SpectrogramComponent;

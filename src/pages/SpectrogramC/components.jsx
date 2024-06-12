import React, { useState } from 'react';
import Waveform from './Waveform';
import SpectrogramCanvas from './audioAnalysis';
import AudioPlayer from '../AudioPlayer';
import Controls from '../Controls';
import RMenu from '../RMenu';
import ProgressBar from '../ProgressBar';
import styled from "styled-components";


const Spe = styled.div`
  margin-bottom: 1120px;
`;

const SpectrogramComponent = ({ audioRef, selectedAudio }) => {
  const [wavesurferInstance, setWavesurferInstance] = useState(null);
  const [wavesurferRegions, setWavesurferRegions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onReady = (ws) => {
    setWavesurferInstance(ws);
    setIsPlaying(false);
  };

  const onCurrentTimeChange = (time) => {
    setCurrentTime(time);
  };

  const onDurationChange = (dur) => {
    setDuration(dur);
  };

  const onRegionsChange = (wsRegions) => {
    setWavesurferRegions(wsRegions);
  };

  const addRegion = (regionName) => {
    if (wavesurferRegions) {
      const existingRegion = wavesurferRegions.getRegions().find(region => region.data && region.data.content === regionName);
      if (existingRegion) {
        console.log(`Region with name "${regionName}" already exists.`);
        return;
      }

      const start = wavesurferInstance.getCurrentTime();
      const end = start + 10;
      const region = wavesurferRegions.addRegion({
        start,
        end,
        data: {},
        color: 'rgba(0, 255, 0, 0.3)',
        content: regionName
      });

      region.data = { ...region.data, content: regionName };

      console.log('Region added:', region);
      console.log('Region content:', region.data ? region.data.content : 'No content');
    }
  };

  const deleteRegion = (regionName) => {
    if (wavesurferRegions) {
      const regions = wavesurferRegions.getRegions();
      console.log('Current regions:', regions);
      let regionFound = false;
      for (const regionId in regions) {
        const region = regions[regionId];
        console.log('Checking region:', region);
        console.log('Region data:', region.data);

        if (region.data && region.data.content === regionName) {
          console.log('Deleting region:', region);
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
     
      <Waveform
        audioRef={audioRef}
        selectedAudio={selectedAudio}
        onReady={onReady}
        onCurrentTimeChange={onCurrentTimeChange}
        onDurationChange={onDurationChange}
        onRegionsChange={onRegionsChange}
        
      />
     
      
      <AudioPlayer
        selectedAudio={selectedAudio}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
  
      <SpectrogramCanvas audioRef={audioRef} />
     
      
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
        />
      )}
    </div>
  );
};

export default SpectrogramComponent;

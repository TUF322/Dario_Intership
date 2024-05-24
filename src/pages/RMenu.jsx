import React, { useState } from 'react';

const RMenu = ({ addRegion, deleteRegion }) => {
  const [regionName, setRegionName] = useState('');

  const handleAddRegion = () => {
    if (regionName.trim() !== '') {
      addRegion(regionName);
      setRegionName(''); // Clear the input after creating the region
    }
  };

  const handleDeleteRegion = () => {
    if (regionName.trim() !== '') {
      deleteRegion(regionName);
      console.log("delete clicked in RMenu");
      setRegionName(''); // Clear the input after deleting the region
    }
  };

  return (
    <div>
      <input
        type="text"
        value={regionName}
        onChange={(e) => setRegionName(e.target.value)}
        placeholder="Enter region name"
      />
      <button onClick={handleAddRegion}>Add Region</button>
      <button onClick={handleDeleteRegion}>Delete Region</button>
    </div>
  );
};

export default RMenu;

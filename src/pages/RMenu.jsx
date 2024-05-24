import React, { useState } from 'react';

const RMenu = ({ addRegion }) => {
  const [regionName, setRegionName] = useState('');

  const handleAddRegion = () => {
    addRegion(regionName);
    setRegionName(''); // Clear the input after creating the region
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
    </div>
  );
};

export default RMenu;

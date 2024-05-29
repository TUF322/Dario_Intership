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
        className="border border-gray-300 p-2 rounded"
      />
      <button onClick={handleAddRegion} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
        Add Region
      </button>
      <button onClick={handleDeleteRegion} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
        Delete Region
      </button>
    </div>
  );
};

export default RMenu;

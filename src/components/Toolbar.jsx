import React from 'react';
import { FiArrowLeft, FiRotateCw, FiRotateCcw } from 'react-icons/fi';
import { BsCloudCheck, BsZoomIn, BsZoomOut } from 'react-icons/bs';

const Toolbar = ({ filename, onBack }) => {
  return (
    <div className="h-14 bg-white shadow px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="text-xl text-gray-600 hover:text-purple-600">
          <FiArrowLeft />
        </button>
        <h2 className="font-semibold text-gray-800">{filename || 'Document'}</h2>
      </div>
      <div className="flex items-center space-x-4 text-gray-600">
        <BsZoomOut />
        <span>100%</span>
        <BsZoomIn />
        <FiRotateCcw />
        <FiRotateCw />
        <BsCloudCheck />
      </div>
    </div>
  );
};

export default Toolbar;

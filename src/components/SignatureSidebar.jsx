import React from 'react';
import { FaSignature, FaTextHeight, FaCalendarAlt, FaCheckSquare } from 'react-icons/fa';
import { MdDriveFileRenameOutline } from 'react-icons/md';

const SignatureSidebar = ({ selectedTool, setSelectedTool }) => {
  return (
    <div className="w-64 bg-gray-50 border-r shadow-inner p-4 space-y-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800">SIGN & EDIT</h2>

      <button
        onClick={() => setSelectedTool('signature')}
        className={`flex items-center w-full px-3 py-2 rounded hover:bg-purple-100 ${
          selectedTool === 'signature' ? 'bg-purple-200' : ''
        }`}
      >
        <FaSignature className="mr-3" /> My Signature
      </button>

      <button
        onClick={() => setSelectedTool('initials')}
        className={`flex items-center w-full px-3 py-2 rounded hover:bg-purple-100 ${
          selectedTool === 'initials' ? 'bg-purple-200' : ''
        }`}
      >
        <MdDriveFileRenameOutline className="mr-3" /> My Initials
      </button>

      <button
        onClick={() => setSelectedTool('text')}
        className={`flex items-center w-full px-3 py-2 rounded hover:bg-purple-100 ${
          selectedTool === 'text' ? 'bg-purple-200' : ''
        }`}
      >
        <FaTextHeight className="mr-3" /> Text
      </button>

      <button
        onClick={() => setSelectedTool('date')}
        className={`flex items-center w-full px-3 py-2 rounded hover:bg-purple-100 ${
          selectedTool === 'date' ? 'bg-purple-200' : ''
        }`}
      >
        <FaCalendarAlt className="mr-3" /> Date Signed
      </button>

      <button
        onClick={() => setSelectedTool('check')}
        className={`flex items-center w-full px-3 py-2 rounded hover:bg-purple-100 ${
          selectedTool === 'check' ? 'bg-purple-200' : ''
        }`}
      >
        <FaCheckSquare className="mr-3" /> Checkmark
      </button>

      <div className="border-t pt-4 text-sm text-gray-500">Add Fields</div>
      {/* Add more components like "Edit Signers", "Radio Button", etc. as needed */}
    </div>
  );
};

export default SignatureSidebar;
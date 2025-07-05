// src/components/SignatureModal.jsx
import React, { useRef, useState } from 'react';

const SignatureModal = ({ onClose, onSelect }) => {
  const canvasRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('draw');
  const [typedName, setTypedName] = useState('');

  // Save drawn signature from canvas
  const getCanvasData = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL('image/png');
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Handle final selection
  const handleDone = () => {
    if (selectedOption === 'draw') {
      onSelect(getCanvasData());
    } else if (selectedOption === 'upload') {
      // will be handled in onSelect
    } else if (selectedOption === 'type') {
      const typedImage = `https://dummyimage.com/200x50/000/fff&text=${encodeURIComponent(typedName)}`;
      onSelect(typedImage);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Add Signature</h2>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setSelectedOption('draw')}
            className={`px-4 py-2 rounded ${selectedOption === 'draw' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            ✍️ Draw
          </button>
          <button
            onClick={() => setSelectedOption('upload')}
            className={`px-4 py-2 rounded ${selectedOption === 'upload' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setSelectedOption('type')}
            className={`px-4 py-2 rounded ${selectedOption === 'type' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            ⌨️ Type
          </button>
        </div>

        {selectedOption === 'draw' && (
          <div className="border p-2">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="border w-full"
              style={{ background: '#f0f0f0', cursor: 'crosshair' }}
              onMouseDown={(e) => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                const draw = (eMove) => {
                  ctx.lineTo(eMove.offsetX, eMove.offsetY);
                  ctx.stroke();
                };
                canvas.onmousemove = draw;
                canvas.onmouseup = () => (canvas.onmousemove = null);
              }}
            />
            <button onClick={clearCanvas} className="mt-2 text-sm text-blue-600 underline">
              Clear
            </button>
          </div>
        )}

        {selectedOption === 'upload' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  onSelect(reader.result); // base64
                  onClose();
                };
                if (file) reader.readAsDataURL(file);
              }}
            />
          </div>
        )}

        {selectedOption === 'type' && (
          <div>
            <input
              type="text"
              placeholder="Type your name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="border w-full p-2 rounded"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          {selectedOption !== 'upload' && (
            <button onClick={handleDone} className="px-4 py-2 bg-purple-600 text-white rounded">
              Use Signature
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;

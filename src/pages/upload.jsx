import React, { useRef, useState , useEffect} from 'react';
import axios from '../utils/api';
import LogoutButton from '../components/Logout';

export default function UploadDocument() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('Loading...');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/me', { withCredentials: true });
        if (res.data.success) setUserEmail(res.data.user.email);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUserEmail('Unknown');
      }
    };
   
    fetchUser();;
  }, []);


  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post('/docs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setMessage(res.data.message || "File uploaded successfully!");
      setFile(null); // clear after upload
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    }
  };

  const handleCancel = () => {
    setFile(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white h-14">
        <h1 className="text-2xl font-bold text-purple-700">SignaturePro</h1>
        <div className="flex items-center gap-6">
          <p className="text-gray-700 text-sm">{userEmail}</p>
          <LogoutButton></LogoutButton>
        </div>
      </header>

      {/* Upload Content */}
      <main className="max-w-3xl mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Upload Document</h2>
            <p className="text-gray-500">Upload a PDF document to add your signature</p>
          </div>
          <button className="text-gray-400 text-3xl hover:text-gray-600">&times;</button>
        </div>

        {file ? (
          <>
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-green-800 font-medium">{file.name}</p>
                  <p className="text-green-700 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                className="text-green-600 hover:text-red-600 text-xl"
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 rounded hover:from-blue-600 hover:to-purple-700 text-center"
              >
                Upload Document
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded hover:bg-gray-300 text-center"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-16 bg-white text-center transition hover:border-purple-500"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 15V3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">Drop your PDF here</h3>
            <p className="text-gray-500 mb-4">or click to browse files</p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-6 rounded hover:from-blue-600 hover:to-purple-700">
              Choose File
            </button>
            <p className="text-sm text-gray-400 mt-2">PDF files only, max 10MB</p>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
        )}
      </main>
    </div>
  );
}










// import React, { useState } from 'react';
// import axios from '../utils/api';

// function Upload() {
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState('');

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setMessage("Please select a file.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post('/docs/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data', 
//         },
//          withCredentials: true
//       });

//       setMessage(res.data.message);
//     } catch (err) {
//       console.error(err);
//       setMessage("Upload failed.");
//     }
//   };

//   return (
//     <div className="p-4 rounded shadow bg-white max-w-md mx-auto mt-10">
//       <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
//       <input type="file" accept="application/pdf" onChange={handleFileChange} />
//       <button
//         onClick={handleUpload}
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
//       >
//         Upload
//       </button>
//       {message && <p className="mt-2 text-gray-700">{message}</p>}
//     </div>
//   );
// }

// export default Upload;

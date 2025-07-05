import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";
import LogoutButton from "../components/Logout";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import axios from "../utils/api";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function DocumentPreview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef();

  const filename = new URLSearchParams(location.search).get("filename");
  const fileUrl = `http://localhost:8080/uploads/${filename}`;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatureText, setSignatureText] = useState("");
  const [font, setFont] = useState("Great Vibes");
  const [color, setColor] = useState("Blue");
  const [fontSize, setFontSize] = useState(24);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState(null);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("Loading...");
  const [existingSignatures, setExistingSignatures] = useState([]);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        if (res.data.success) setUserEmail(res.data.user.email);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUserEmail("Unknown");
      }
    };
    fetchUser();
  }, []);
    useEffect(() => {
    async function fetchSignatures() {
      try {
        const res = await axios.get(`/signatures/${id}`, { withCredentials: true });
        if (res.data.success) setExistingSignatures(res.data.signatures);
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    }
    fetchSignatures();
    }, [id]);

  const handleAddSignature = () => {
  if (!pageWidth || !pageHeight) {
    console.error("Page dimensions not set yet!");
    return;
  }
  const x = pageWidth / 2 - 50;
  const y = pageHeight / 2 - 20;
  console.log(`Adding signature at x=${x}px, y=${y}px on pageHeight=${pageHeight}px → relativeY=${y / pageHeight}`);
  const aspectRatio = pageWidth / pageHeight;
  const flippedRelativeY = 1 - y / pageHeight;
  setSignaturePosition({
    
      x,
      y,
      relativeX: x / pageWidth,
      relativeY: flippedRelativeY, // flip Y during save
      page: parseInt(selectedPage, 10),
      aspectRatio, // send this to backend!
  });
};


  const handleSaveSign = async () => {
    if (!signatureText.trim()) {
  alert("Please enter your signature text before saving!");
  return;
}
    if (!signaturePosition) {
      alert("Please place your signature before saving!");
      return;
    }
const frontendAspect = pageWidth / pageHeight;
const backendAspect = 595.5 / 842.25; // fixed to your actual PDF's aspect ratio
const scaleCorrection = backendAspect / frontendAspect;
const correctedRelativeY = signaturePosition.relativeY * scaleCorrection;

console.log(`🚨 Corrected relativeY=${correctedRelativeY} (scaleCorrection=${scaleCorrection})`);
    try {
      const payload = {
        fileId: id,
         x: signaturePosition.relativeX,
         y: signaturePosition.relativeY,
        page: signaturePosition.page,
        imageData: signatureText,
        aspectRatio: pageWidth / pageHeight, // include aspect ratio
      };
      const saveRes = await axios.post("/signatures/save", payload, { withCredentials: true });
      if (!saveRes.data.success) throw new Error("Signature save failed!");

//****************************** */
setMessage("Signature saved! Generating signed PDF...");
      
    const genRes = await axios.post(`/signatures/generate/${id}`, {}, { withCredentials: true });
    if (!genRes.data.success) throw new Error("Failed to generate signed PDF");

    setMessage("Signed PDF created! Redirecting to Dashboard...");

      setMessage("Signature saved & document signed! Redirecting...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      navigate("/documents");  
    } catch (err) {
      console.error("Error during sign process:", err);
      setMessage("Failed to sign document.");
    }
  };

  const handleDownloadSigned = () => {
    const handleDownloadSigned = async () => {
  try {
    setMessage("Generating signed PDF...");
    const genRes = await axios.post(`/signatures/generate/${id}`, {}, { withCredentials: true });
    if (genRes.data.success) {
      setMessage("Signed document generated! Downloading...");
      window.location.href = `http://localhost:8080${genRes.data.url}`;
    } else {
      throw new Error("Failed to generate signed PDF");
    }
  } catch (error) {
    console.error("Error generating signed PDF:", error);
    setMessage("Failed to generate signed PDF");
  }
};
  };

  const DraggableSignature = () => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "signature" });
    if (!signaturePosition) return null;

    const style = {
      position: "absolute",
      top: 0,
      left: 0,
      transform: transform
        ? `translate3d(${signaturePosition.x + transform.x}px, ${signaturePosition.y + transform.y}px, 0)`
        : `translate3d(${signaturePosition.x}px, ${signaturePosition.y}px, 0)`,
      fontFamily: font,
      color: color.toLowerCase(),
      fontSize: `${fontSize}px`,
      whiteSpace: "nowrap",
      cursor: "grab",
      userSelect: "none",
      zIndex: 50,
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {signatureText || "Your Signature"}
      </div>
    );
  };

  const handleDragEnd = (event) => {
    if (event.active.id === "signature") {
      const { delta } = event;
      setSignaturePosition((prev) => ({
        ...prev,
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-purple-700">DocSign</h1>
        <div className="flex items-center gap-6">
          <p className="text-gray-700 text-sm">{userEmail}</p>
          <LogoutButton />
        </div>
      </header>

      <main className="flex justify-center items-start py-10 px-4 ml-32 mr-32">
        <div className="flex w-full max-w-6xl bg-gray-50 shadow-lg rounded-lg p-6 gap-6">
          {/* PDF Viewer + Draggable Signature */}
          <DndContext onDragEnd={handleDragEnd}>
            <div ref={viewerRef} className="w-[65%] relative shadow-xl border-gray-200 rounded-md p-4 flex flex-col">
              <div className="flex justify-between items-center border-0 pb-2 mb-4">
                <span className="font-medium text-gray-700 truncate">{filename}</span>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>

              <div className="flex-grow flex justify-center overflow-y-auto rounded max-h-150 p-2 relative">
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                  pageNumber={pageNumber}
                  width={480}
                  onRenderSuccess={({ width, height }) => {
                    setPageHeight(height);
                    setPageWidth(width);
                    console.log(`🚨 Frontend: Page rendered with width=${width}, height=${height}`);
                  }}
                  renderAnnotationLayer
                  renderTextLayer
                />
                </Document>
                {signaturePosition && signaturePosition.page === pageNumber && <DraggableSignature />}
              </div>

              <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                  Previous
                </button>
                <span>Page {pageNumber} of {numPages || "--"}</span>
                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber === numPages}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </DndContext>

          {/* Signature Controls */}
          <div className="w-[35%] shadow-xl rounded-md p-4 max-h-150 mt-12">
            <h2 className="text-lg font-semibold mb-4">Signature Controls</h2>

            <label className="block text-sm font-medium mb-1">Signature Text</label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your signature"
              className="w-full border-0 px-3 py-2 rounded mb-4 focus:ring focus:ring-purple-500 shadow-md bg-white"
            />

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Font</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full border-0 px-2 py-2 rounded shadow-md bg-white">
                  <option>Great Vibes</option>
                  <option>Pacifico</option>
                  <option>Roboto</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Color</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full border-0 shadow-md bg-white px-2 py-2 rounded">
                  <option>Blue</option>
                  <option>Black</option>
                  <option>Red</option>
                </select>
              </div>
            </div>

            <label className="block text-sm font-medium mb-1">Font Size</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full border-0 shadow-md bg-white px-3 py-2 rounded mb-4"
            />

            <label className="block text-sm font-medium mb-1">Page</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full border-0 shadow-md bg-white px-2 py-2 mb-6 rounded">
              {Array.from({ length: numPages || 1 }, (_, i) => (
                <option key={i} value={i + 1}>Page {i + 1}</option>
              ))}
            </select>

            <button
              onClick={handleAddSignature}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded mb-4 hover:bg-purple-700 font-bold">
              Add Signature
            </button>

            <button
              onClick={handleSaveSign}
              className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-700 font-bold">
              Save and Sign
            </button>

            <button
              onClick={handleDownloadSigned}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white py-2 rounded hover:bg-green-700 font-bold">
              Download Signed
            </button>

            {message && <p className="text-center mt-4 text-green-600">{message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}











// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import toast from 'react-hot-toast';
// import { Document, Page, pdfjs } from "react-pdf";
// import { DndContext, useDraggable } from "@dnd-kit/core";
// import LogoutButton from "../components/Logout";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";
// import axios from "../utils/api";

// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// export default function DocumentPreview() {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const viewerRef = useRef();

//   const filename = new URLSearchParams(location.search).get("filename");
//   const fileUrl = `http://localhost:8080/uploads/${filename}`;

//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [signatureText, setSignatureText] = useState("");
//   const [font, setFont] = useState("Great Vibes");
//   const [color, setColor] = useState("Blue");
//   const [fontSize, setFontSize] = useState(24);
//   const [selectedPage, setSelectedPage] = useState(1);
//   const [signaturePosition, setSignaturePosition] = useState(null);
//   const [message, setMessage] = useState("");
//   const [userEmail, setUserEmail] = useState("Loading...");
//   const [existingSignatures, setExistingSignatures] = useState([]);
  

//   const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get("/auth/me", { withCredentials: true });
//         if (res.data.success) setUserEmail(res.data.user.email);
//       } catch (err) {
//         console.error("Failed to fetch user:", err);
//         setUserEmail("Unknown");
//       }
//     };
//     fetchUser();
//   }, []);
//     useEffect(() => {
//     async function fetchSignatures() {
//       try {
//         const res = await axios.get(`/signatures/${id}`, { withCredentials: true });
//         if (res.data.success) setExistingSignatures(res.data.signatures);
//       } catch (e) {
//         console.error("Failed to load signatures:", e);
//       }
//     }
//     fetchSignatures();
//     }, [id]);

//   const handleAddSignature = () => {
//     const viewer = viewerRef.current;
//     if (!viewer) return;
//     const rect = viewer.getBoundingClientRect();
//     const x = rect.width / 2 - 50;
//     const y = rect.height / 2 - 20;
//     setSignaturePosition({
//      x,
//      y,
//     relativeX: x / rect.width,
//     relativeY: y / rect.height,
//     page: parseInt(selectedPage, 10),
//     });
//   };


//   const handleSaveSign = async () => {
//     if (!signatureText.trim()) {
//   alert("Please enter your signature text before saving!");
//   return;
// }
//     if (!signaturePosition) {
//       alert("Please place your signature before saving!");
//       return;
//     }
//     try {
//       const payload = {
//         fileId: id,
//         x: signaturePosition.relativeX, 
//         y: signaturePosition.relativeY,
//         page: signaturePosition.page,
//         imageData: signatureText,
//       };
//       const saveRes = await axios.post("/signatures/save", payload, { withCredentials: true });
//       if (!saveRes.data.success) throw new Error("Signature save failed!");

// //****************************** */
// setMessage("Signature saved! Generating signed PDF...");
      
//     const genRes = await axios.post(`/signatures/generate/${id}`, {}, { withCredentials: true });
//     if (!genRes.data.success) throw new Error("Failed to generate signed PDF");

//     setMessage("Signed PDF created! Redirecting to Dashboard...");

//       setMessage("Signature saved & document signed! Redirecting...");
//       await new Promise((resolve) => setTimeout(resolve, 10000));
//       navigate("/documents");  
//     } catch (err) {
//       console.error("Error during sign process:", err);
//       setMessage("Failed to sign document.");
//     }
//   };

//   const handleDownloadSigned = () => {
//     const handleDownloadSigned = async () => {
//   try {
//     setMessage("Generating signed PDF...");
//     const genRes = await axios.post(`/signatures/generate/${id}`, {}, { withCredentials: true });
//     if (genRes.data.success) {
//       setMessage("Signed document generated! Downloading...");
//       window.location.href = `http://localhost:8080${genRes.data.url}`;
//     } else {
//       throw new Error("Failed to generate signed PDF");
//     }
//   } catch (error) {
//     console.error("Error generating signed PDF:", error);
//     setMessage("Failed to generate signed PDF");
//   }
// };
//   };

//   const DraggableSignature = () => {
//     const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "signature" });
//     if (!signaturePosition) return null;

//     const style = {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       transform: transform
//         ? `translate3d(${signaturePosition.x + transform.x}px, ${signaturePosition.y + transform.y}px, 0)`
//         : `translate3d(${signaturePosition.x}px, ${signaturePosition.y}px, 0)`,
//       fontFamily: font,
//       color: color.toLowerCase(),
//       fontSize: `${fontSize}px`,
//       whiteSpace: "nowrap",
//       cursor: "grab",
//       userSelect: "none",
//       zIndex: 50,
//     };

//     return (
//       <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
//         {signatureText || "Your Signature"}
//       </div>
//     );
//   };

//   const handleDragEnd = (event) => {
//     if (event.active.id === "signature") {
//       const { delta } = event;
//       setSignaturePosition((prev) => ({
//         ...prev,
//         x: prev.x + delta.x,
//         y: prev.y + delta.y,
//       }));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-purple-50">
//       <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
//         <h1 className="text-2xl font-bold text-purple-700">DocSign</h1>
//         <div className="flex items-center gap-6">
//           <p className="text-gray-700 text-sm">{userEmail}</p>
//           <LogoutButton />
//         </div>
//       </header>

//       <main className="flex justify-center items-start py-10 px-4 ml-32 mr-32">
//         <div className="flex w-full max-w-6xl bg-gray-50 shadow-lg rounded-lg p-6 gap-6">
//           {/* PDF Viewer + Draggable Signature */}
//           <DndContext onDragEnd={handleDragEnd}>
//             <div ref={viewerRef} className="w-[65%] relative shadow-xl border-gray-200 rounded-md p-4 flex flex-col">
//               <div className="flex justify-between items-center border-0 pb-2 mb-4">
//                 <span className="font-medium text-gray-700 truncate">{filename}</span>
//                 <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600">
//                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3l7 7m0 0l-7 7m7-7H3" />
//                   </svg>
//                 </a>
//               </div>

//               <div className="flex-grow flex justify-center overflow-y-auto rounded max-h-150 p-2 relative">
//                 <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
//                   <Page pageNumber={pageNumber} width={480} renderAnnotationLayer renderTextLayer />
//                 </Document>
//                 {signaturePosition && signaturePosition.page === pageNumber && <DraggableSignature />}
//               </div>

//               <div className="flex justify-center items-center gap-4 mt-4 text-sm">
//                 <button
//                   onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
//                   disabled={pageNumber === 1}
//                   className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
//                   Previous
//                 </button>
//                 <span>Page {pageNumber} of {numPages || "--"}</span>
//                 <button
//                   onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
//                   disabled={pageNumber === numPages}
//                   className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
//                   Next
//                 </button>
//               </div>
//             </div>
//           </DndContext>

//           {/* Signature Controls */}
//           <div className="w-[35%] shadow-xl rounded-md p-4 max-h-150 mt-12">
//             <h2 className="text-lg font-semibold mb-4">Signature Controls</h2>

//             <label className="block text-sm font-medium mb-1">Signature Text</label>
//             <input
//               type="text"
//               value={signatureText}
//               onChange={(e) => setSignatureText(e.target.value)}
//               placeholder="Enter your signature"
//               className="w-full border-0 px-3 py-2 rounded mb-4 focus:ring focus:ring-purple-500 shadow-md bg-white"
//             />

//             <div className="flex gap-2 mb-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium mb-1">Font</label>
//                 <select
//                   value={font}
//                   onChange={(e) => setFont(e.target.value)}
//                   className="w-full border-0 px-2 py-2 rounded shadow-md bg-white">
//                   <option>Great Vibes</option>
//                   <option>Pacifico</option>
//                   <option>Roboto</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label className="block text-sm font-medium mb-1">Color</label>
//                 <select
//                   value={color}
//                   onChange={(e) => setColor(e.target.value)}
//                   className="w-full border-0 shadow-md bg-white px-2 py-2 rounded">
//                   <option>Blue</option>
//                   <option>Black</option>
//                   <option>Red</option>
//                 </select>
//               </div>
//             </div>

//             <label className="block text-sm font-medium mb-1">Font Size</label>
//             <input
//               type="number"
//               value={fontSize}
//               onChange={(e) => setFontSize(e.target.value)}
//               className="w-full border-0 shadow-md bg-white px-3 py-2 rounded mb-4"
//             />

//             <label className="block text-sm font-medium mb-1">Page</label>
//             <select
//               value={selectedPage}
//               onChange={(e) => setSelectedPage(e.target.value)}
//               className="w-full border-0 shadow-md bg-white px-2 py-2 mb-6 rounded">
//               {Array.from({ length: numPages || 1 }, (_, i) => (
//                 <option key={i} value={i + 1}>Page {i + 1}</option>
//               ))}
//             </select>

//             <button
//               onClick={handleAddSignature}
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded mb-4 hover:bg-purple-700 font-bold">
//               Add Signature
//             </button>

//             <button
//               onClick={handleSaveSign}
//               className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-700 font-bold">
//               Save and Sign
//             </button>

//             <button
//               onClick={handleDownloadSigned}
//               className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white py-2 rounded hover:bg-green-700 font-bold">
//               Download Signed
//             </button>

//             {message && <p className="text-center mt-4 text-green-600">{message}</p>}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }








// WORKING BEFORE SIGNATURE IMPLEMENT 
// import React, { useState , useEffect } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { Document, Page, pdfjs } from "react-pdf";
// import LogoutButton from "../components/Logout";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";
// import axios from '../utils/api';

// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// function DocumentPreview() {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const filename = new URLSearchParams(location.search).get("filename");

//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [signatureText, setSignatureText] = useState("");
//   const [font, setFont] = useState("Great Vibes");
//   const [color, setColor] = useState("Blue");
//   const [fontSize, setFontSize] = useState(24);
//   const [selectedPage, setSelectedPage] = useState(1);
//   const [userEmail, setUserEmail] = useState('Loading...');
//   const fileUrl = `http://localhost:8080/uploads/${filename}`;
//   const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  
//   const [existingSignatures, setExistingSignatures] = useState([]);

// useEffect(() => {
//   async function fetchSignatures() {
//     try {
//       const res = await axios.get(`/signatures/${id}`, { withCredentials: true });
//       if (res.data.success) setExistingSignatures(res.data.signatures);
//     } catch (e) {
//       console.error("Failed to load signatures:", e);
//     }
//   }
//   fetchSignatures();
// }, [id]);



//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get('/auth/me', { withCredentials: true });
//         if (res.data.success) setUserEmail(res.data.user.email);
//       } catch (err) {
//         console.error('Failed to fetch user:', err);
//         setUserEmail('Unknown');
//       }
//     };
//     fetchUser();
    
//   }, []);
//   const handleAddSignature = () => {
//     alert(`Signature "${signatureText}" added on page ${selectedPage}`);
//   };

//   const handleSaveSign = () => {
//     alert("Signature saved and document signed!");
//     navigate("/documents");
//   };

//   const handleDownloadSigned = () => {
//     alert("Download functionality pending backend work.");
//   };

//   return (
//     <div className="min-h-screen bg-purple-50">
//        {/* Header */}
//             <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
//               <h1 className="text-2xl font-bold text-purple-700">DocSign</h1>
//               <div className="flex items-center gap-6">
//                 <p className="text-gray-700 text-sm">{userEmail}</p>
//                 <LogoutButton></LogoutButton>
//               </div>
//             </header>

//       {/* Main Container */}
//       <main className="flex justify-center items-start py-10 px-4 ml-32 mr-32 ">
//         <div className="flex w-full max-w-6xl bg-gray-50 shadow-lg  rounded-lg  p-6 gap-6">
//           {/* PDF Preview Panel */}
//           <div className="w-[65%] shadow-xl border-0.125 rounded-md p-4 flex flex-col ">
//             {/* Top bar with filename */}
//             <div className="flex justify-between items-center border-b pb-2 mb-4 0">
//               <span className="font-medium text-gray-700 truncate ">{filename}</span>
//               <a
//                 href={fileUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-500 hover:text-purple-600"
//               >
//                 <svg
//                   className="h-5 w-5 bg-grey-300"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M14 3l7 7m0 0l-7 7m7-7H3"
//                   />
//                 </svg>
//               </a>
//             </div>

//             {/* PDF Document */}
//             <div className="flex-grow flex justify-center overflow-y-auto  rounded , max-h-150  p-2">
//               <Document
//                 file={fileUrl}
//                 onLoadSuccess={onDocumentLoadSuccess}
//                 loading={<p>Loading...</p>}
//               >
//                 <Page
//                   pageNumber={pageNumber}
//                   width={480}
//                   renderAnnotationLayer
//                   renderTextLayer
//                 />
//               </Document>
//             </div>

//             {/* Page Navigation */}
//             <div className="flex justify-center items-center gap-4 mt-4 text-sm">
//               <button
//                 onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
//                 disabled={pageNumber === 1}
//                 className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <span>Page {pageNumber} of {numPages || "--"}</span>
//               <button
//                 onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
//                 disabled={pageNumber === numPages}
//                 className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>

//           {/* Signature Controls */}
//           <div className="w-[35%] shadow-xl rounded-md p-4  max-h-150 mt-12 ">
//             <h2 className="text-lg font-semibold mb-4">Signature Controls</h2>

//             {/* Signature Text */}
//             <label className="block text-sm font-medium mb-1">Signature Text</label>
//             <input
//               type="text"
//               value={signatureText}
//               onChange={(e) => setSignatureText(e.target.value)}
//               placeholder="Enter your sign"
//               className="w-full  border-0 px-3 py-2 rounded mb-4 focus:ring focus:ring-purple-500 shadow-md bg-white-50"
//             />

//             {/* Font & Color */}
//             <div className="flex gap-2 mb-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium mb-1">Font</label>
//                 <select
//                   value={font}
//                   onChange={(e) => setFont(e.target.value)}
//                   className="w-full border-0 px-2 py-2 rounded shadow-md bg-white-50"
//                 >
//                   <option>Great Vibes</option>
//                   <option>Pacifico</option>
//                   <option>Roboto</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label className="block text-sm font-medium mb-1">Color</label>
//                 <select
//                   value={color}
//                   onChange={(e) => setColor(e.target.value)}
//                   className="w-full border-0 shadow-md bg-white-50 px-2 py-2 rounded"
//                 >
//                   <option>Blue</option>
//                   <option>Black</option>
//                   <option>Red</option>
//                 </select>
//               </div>
//             </div>

//             {/* Font Size */}
//             <label className="block text-sm font-medium mb-1">Font Size</label>
//             <input
//               type="number"
//               value={fontSize}
//               onChange={(e) => setFontSize(e.target.value)}
//               className="w-full border-0 shadow-md bg-white-50 px-3 py-2 rounded mb-4"
//             />

//             {/* Page Selection */}
//             <label className="block text-sm font-medium mb-1">Page</label>
//             <select
//               value={selectedPage}
//               onChange={(e) => setSelectedPage(e.target.value)}
//               className="w-full border-0 shadow-md bg-white-50 px-2 py-2 mb-6 rounded"
//             >
//               {Array.from({ length: numPages || 1 }, (_, i) => (
//                 <option key={i} value={i + 1}>Page {i + 1}</option>
//               ))}
//             </select>

//             {/* Buttons */}
//             <button
//               onClick={handleAddSignature}
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded mb-4 hover:bg-purple-700 font-bold"
//             >
//               Add Signature
//             </button>

//             <button
//               onClick={handleSaveSign}
//               className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-700 font-bold"
//             >
//               Save and Sign
//             </button>

//             <button
//               onClick={handleDownloadSigned}
//               className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white py-2 rounded hover:bg-green-700 font-bold"
//             >
//               Download Signed
//             </button>
//           </div>
//         </div>
//         {existingSignatures.map(sig =>
//   sig.page === pageNumber && (
//     <div
//       key={sig._id}
//       className="absolute"
//       style={{
//         top: viewerRef.current ? viewerRef.current.getBoundingClientRect().height - sig.y : 0,
//         left: sig.x,
//         fontFamily: font,
//         color: color.toLowerCase(),
//         fontSize: `${fontSize}px`,
//         whiteSpace: "nowrap",
//       }}
//     >
//       {sig.imageData}
//     </div>
//   )
// )}
//       </main>
//     </div>
//   );
// }

// export default DocumentPreview;









// import React, { useState } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { Document, Page, pdfjs } from "react-pdf";
// import LogoutButton from '../components/Logout';
// import { Link } from 'react-router-dom';
// import axios from "../utils/api";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// function DocumentPreview() {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const filename = new URLSearchParams(location.search).get("filename");

//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [signatureText, setSignatureText] = useState("");
//   const [font, setFont] = useState("Great Vibes");
//   const [color, setColor] = useState("Blue");
//   const [fontSize, setFontSize] = useState(24);
//   const [selectedPage, setSelectedPage] = useState(1);

//   const fileUrl = `http://localhost:8080/uploads/${filename}`;

//   const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

//   const handleAddSignature = () => {
//     alert(`Signature "${signatureText}" added on page ${selectedPage}`);
//   };

//   const handleSaveSign = () => {
//     alert("Signature saved and document signed!");
//     navigate("/dashboard");
//   };

//   const handleDownloadSigned = () => {
//     alert("This should trigger signed PDF download (implement in backend).");
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//        <header className="w-full bg-white shadow-md py-4 px-8  flex justify-between items-center fixed top-0">
//         <h1 className="text-xl font-bold text-purple-700">DocSign</h1>
//         <nav className="space-x-4">
//           <Link to="/login" className="text-gray-700 hover:text-purple-700 font-medium">
//             Login
//           </Link>
//           <Link to="/signup" className="text-gray-700 hover:text-purple-700 font-medium">
//             Signup
//           </Link>
//            <LogoutButton></LogoutButton>
//         </nav>
//       </header>
//     <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-white to-purple-50 px-4 py-8 md:px-12">
//     <div className="flex flex-col md:flex-row min-h-20 bg-gradient-to-br from-white to-purple-50 px-4 py-8 md:px-12">
//       {/* PDF Viewer */}
//       <div className="flex-1 flex flex-col items-center bg-white rounded-xl shadow-lg p-4 md:p-6 max-w-3xl mx-auto md:mx-0 mb-8 md:mb-0">
//         {/* Filename bar */}
//         <div className="w-full border-b pb-3 mb-4 flex justify-between items-center">
//           <p className="font-semibold text-gray-700 truncate">{filename}</p>
//           <button
//             className="text-gray-500 hover:text-purple-600"
//             onClick={() => window.open(fileUrl, "_blank")}
//           >
//             <svg
//               className="h-5 w-5 inline"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3l7 7m0 0l-7 7m7-7H3" />
//             </svg>
//           </button>
//         </div>

//         {/* Document */}
//         <div className="flex-grow flex justify-center items-center overflow-y-auto w-full">
//           <Document
//             file={fileUrl}
//             onLoadSuccess={onDocumentLoadSuccess}
//             loading={<p>Loading document...</p>}
//             error={<p className="text-red-600">Failed to load document.</p>}
//           >
//             <Page pageNumber={pageNumber} width={600} renderAnnotationLayer renderTextLayer />
//           </Document>
//         </div>

//         {/* Navigation */}
//         <div className="flex justify-between items-center w-full mt-4">
//           <button
//             onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
//             disabled={pageNumber === 1}
//             className={`px-4 py-2 rounded ${pageNumber === 1 ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}
//           >
//             Previous
//           </button>
//           <p className="text-sm text-gray-600">
//             Page {pageNumber} of {numPages || "--"}
//           </p>
//           <button
//             onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}
//             disabled={pageNumber === numPages}
//             className={`px-4 py-2 rounded ${pageNumber === numPages ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Signature Controls */}
//       <div className="w-full md:w-80 bg-white rounded-xl shadow-lg p-6 ml-0 md:ml-8 flex flex-col justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800 mb-4">Signature Controls</h2>

//           <label className="block text-sm font-medium text-gray-700 mb-1">Signature Text</label>
//           <input
//             type="text"
//             value={signatureText}
//             onChange={(e) => setSignatureText(e.target.value)}
//             placeholder="Enter your signature"
//             className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-purple-300"
//           />

//           <div className="flex gap-2 mb-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
//               <select
//                 className="w-full border rounded px-2 py-2 focus:outline-none focus:ring focus:ring-purple-300"
//                 value={font}
//                 onChange={(e) => setFont(e.target.value)}
//               >
//                 <option>Great Vibes</option>
//                 <option>Pacifico</option>
//                 <option>Roboto</option>
//               </select>
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
//               <select
//                 className="w-full border rounded px-2 py-2 focus:outline-none focus:ring focus:ring-purple-300"
//                 value={color}
//                 onChange={(e) => setColor(e.target.value)}
//               >
//                 <option>Blue</option>
//                 <option>Black</option>
//                 <option>Red</option>
//               </select>
//             </div>
//           </div>

//           <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
//           <input
//             type="number"
//             value={fontSize}
//             onChange={(e) => setFontSize(e.target.value)}
//             className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-purple-300"
//           />

//           <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
//           <select
//             className="w-full border rounded px-2 py-2 mb-6 focus:outline-none focus:ring focus:ring-purple-300"
//             value={selectedPage}
//             onChange={(e) => setSelectedPage(e.target.value)}
//           >
//             {Array.from({ length: numPages || 1 }, (_, i) => (
//               <option key={i} value={i + 1}>Page {i + 1}</option>
//             ))}
//           </select>

//           <button
//             className="w-full bg-purple-600 text-white py-3 rounded mb-4 hover:bg-purple-700 transition"
//             onClick={handleAddSignature}
//           >
//             Add Signature
//           </button>

//           <button
//             className="w-full bg-green-600 text-white py-3 rounded mb-4 hover:bg-green-700 transition"
//             onClick={handleSaveSign}
//           >
//             Save & Sign Document
//           </button>

//           <button
//             className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
//             onClick={handleDownloadSigned}
//           >
//             Download Signed PDF
//           </button>
//         </div>
//       </div>
//     </div>
//     </div>
//     </div>
//   );
// }

// export default DocumentPreview;












// import React, { useRef, useState, useEffect } from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axios from '../utils/api';

// import SignatureSidebar from '../components/SignatureSidebar';
// import Toolbar from '../components/Toolbar';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const viewerRef = useRef(null);

//   const [signatures, setSignatures] = useState([]);
//   const [selectedTool, setSelectedTool] = useState('signature');
//   const [filename, setFilename] = useState('');

//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   // Get ?filename param from URL
//   useEffect(() => {
//     const fileParam = new URLSearchParams(location.search).get('filename');
//     if (fileParam) setFilename(fileParam);
//   }, [location]);

//   // Fetch signatures
//   useEffect(() => {
//     const fetchSignatures = async () => {
//       try {
//         const res = await axios.get(`http://localhost:8080/api/signatures/${id}`, {
//           withCredentials: true,
//         });
//         if (res.data.success) setSignatures(res.data.signatures);
//       } catch (err) {
//         console.error('Error loading signatures', err);
//       }
//     };
//     fetchSignatures();
//   }, [id]);

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Top Toolbar */}
//       <Toolbar filename={filename} onBack={() => navigate('/documents')} />

//       <div className="flex flex-grow overflow-hidden">
//         {/* Sidebar */}
//         <SignatureSidebar
//           selectedTool={selectedTool}
//           setSelectedTool={setSelectedTool}
//         />

//         {/* Main PDF Viewer */}
//         <div className="flex flex-col flex-grow bg-white relative">
//           <div className="flex-grow overflow-hidden relative" ref={viewerRef}>
//             <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
//               <Viewer
//                 fileUrl={`http://localhost:8080/uploads/${filename}`}
//                 plugins={[defaultLayoutPluginInstance]}
//               />
//             </Worker>

//             {/* Signature Overlays */}
//             {signatures.map((sig, index) => (
//               <img
//                 key={index}
//                 src={sig.imageData}
//                 alt="signature"
//                 className="absolute pointer-events-none"
//                 style={{
//                   top: `${sig.y}px`,
//                   left: `${sig.x}px`,
//                   width: '100px',
//                   height: '50px',
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;







// DOCUMENT SIGNATURE

// import React, { useRef, useState, useEffect } from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import { searchPlugin } from '@react-pdf-viewer/search';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axios from '../utils/api'; // ✅ this sends cookies automatically

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import '@react-pdf-viewer/search/lib/styles/index.css';

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const filename = new URLSearchParams(location.search).get('filename');

//   const viewerContainerRef = useRef(null);
//   const defaultLayoutPluginInstance = defaultLayoutPlugin();
//   const searchPluginInstance = searchPlugin();

//   const [signatures, setSignatures] = useState([]);
//   const [placing, setPlacing] = useState(false);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const fetchSignatures = async () => {
//       try {
//         const res = await axios.get(`http://localhost:8080/api/signatures/${id}`, {
//            withCredentials: true,
//         });
//         if (res.data.success) {
//           setSignatures(res.data.signatures);
//         }
//       } catch (err) {
//         console.error('❌ Error fetching signatures:', err);
//       }
//     };
//     fetchSignatures();
//   }, [id]);

//   // Track mouse movement
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const rect = viewerContainerRef.current.getBoundingClientRect();
//       setMousePos({
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       });
//     };

//     if (placing) {
//       viewerContainerRef.current.addEventListener('mousemove', handleMouseMove);
//     }

//     return () => {
//       if (viewerContainerRef.current)
//         viewerContainerRef.current.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, [placing]);

//   const handlePDFClick = async (e) => {
//     if (!placing) return;

//     const rect = viewerContainerRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const signature = {
//       fileId: id,
//       signer: '685f5d1dc3e469b608339a36', // Hardcoded for now
//       x,
//       y,
//       page: 1,
//       imageData:
//         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
//     };

//     try {
//       const res = await axios.post('http://localhost:8080/api/signatures/save', signature);
//       if (res.data.success) {
//         setSignatures((prev) => [...prev, res.data.signature]);
//         setPlacing(false);
//       }
//     } catch (error) {
//       console.error('❌ Failed to save signature:', error);
//     }
//   };

//   return (
//     <div className="h-screen w-screen bg-gray-100 flex flex-col">
//       {/* Header */}
//       <div className="h-16 bg-white shadow flex items-center justify-between px-6">
//         <div className="text-lg font-bold text-gray-800">DocSign - Document Viewer</div>
//         <div className="space-x-3">
//           <button
//             onClick={() => setPlacing(!placing)}
//             className={`${
//               placing ? 'bg-red-500' : 'bg-green-600'
//             } text-white px-4 py-2 rounded transition`}
//           >
//             {placing ? 'Cancel' : 'Add Signature'}
//           </button>
//           <button
//             onClick={() => navigate('/documents')}
//             className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
//           >
//             ← Back to Dashboard
//           </button>
//         </div>
//       </div>

//       {/* Viewer */}
//       <div
//         ref={viewerContainerRef}
//         className="flex-grow relative bg-white"
//         onClick={handlePDFClick}
//         style={{ height: 'calc(100vh - 4rem)' }}
//       >
//         <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
//           <Viewer
//             fileUrl={`http://localhost:8080/uploads/${filename}`}
//             plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
//           />
//         </Worker>

//         {/* Live floating preview while placing */}
//         {placing && (
//           <img
//             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
//             alt="preview"
//             style={{
//               position: 'absolute',
//               left: mousePos.x,
//               top: mousePos.y,
//               width: '100px',
//               height: '50px',
//               transform: 'translate(-50%, -50%)',
//               opacity: 0.7,
//               pointerEvents: 'none',
//               zIndex: 10,
//             }}
//           />
//         )}

//         {/* Placed Signatures */}
//         {signatures.map((sig, index) => (
//           <img
//             key={index}
//             src={sig.imageData}
//             alt="signature"
//             style={{
//               position: 'absolute',
//               left: `${sig.x}px`,
//               top: `${sig.y}px`,
//               width: '100px',
//               height: '50px',
//               pointerEvents: 'none',
//               zIndex: 5,
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;










// import React, { useEffect, useRef, useState } from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import { searchPlugin } from '@react-pdf-viewer/search';

// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import '@react-pdf-viewer/search/lib/styles/index.css';

// const DocumentPreview = () => {
//   const { id } = useParams(); // ✅ This is the MongoDB _id
//   const location = useLocation();
//   const navigate = useNavigate();
//   const filename = new URLSearchParams(location.search).get('filename'); // ✅ Get real filename from query

//   const [signatures, setSignatures] = useState([]);
//   const [isPlacingSignature, setIsPlacingSignature] = useState(false);
//   useEffect(() => {
//     const fetchSignatures = async () => {
//       try {
//         const res = await axios.get(`http://localhost:8080/api/signatures/${id}`, {
//           withCredentials: true,
//         });
//         if (res.data.success) {
//           setSignatures(res.data.signatures);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching signatures:', error);
//       }
//     };

//     fetchSignatures();
//   }, [id]);

//   const defaultLayoutPluginInstance = defaultLayoutPlugin();
//   const searchPluginInstance = searchPlugin();
//   const viewerContainerRef = useRef(null);

//   return (
//     <div className="h-screen w-screen bg-gray-100 flex flex-col">
//       {/* Header */}
//       <div className="h-16 bg-white shadow flex items-center justify-between px-6">
//         <div className="text-lg font-bold text-gray-800">DocSign - Document Viewer</div>
//         <button
//           onClick={() => navigate('/documents')}
//           className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
//         >
//           ← Back to Dashboard
//         </button>
//       </div>

//       {/* PDF Viewer */}
//       <div
//         ref={viewerContainerRef}
//         className="flex-grow bg-white overflow-hidden relative"
//         style={{ height: 'calc(100vh - 4rem)' }}
//       >
//         <button
//           onClick={() => setIsPlacingSignature(true)}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
//         >
//           ➕ Add Signature
//         </button>
//         <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
//           <Viewer
//             fileUrl={`http://localhost:8080/uploads/${filename}`} // ✅ Using actual filename
//             plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
//           />
//         </Worker>

//         {/* Signature overlays */}
//         {signatures.map((sig, index) => (
//           <img
//             key={index}
//             src={sig.imageData}
//             alt="Signature"
//             style={{
//               position: 'absolute',
//               left: `${sig.x}px`,
//               top: `${sig.y}px`,
//               width: '100px',
//               height: '50px',
//               pointerEvents: 'none',
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;









//WORKING CODE BEFORE SIGNATURE 
// import React, { useRef } from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import { searchPlugin } from '@react-pdf-viewer/search';
// import { useParams, useNavigate } from 'react-router-dom';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import '@react-pdf-viewer/search/lib/styles/index.css';

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const defaultLayoutPluginInstance = defaultLayoutPlugin();
//   const searchPluginInstance = searchPlugin();

//   const viewerContainerRef = useRef(null); // ✅ ref for full-screen

//   return (
//     <div className="h-screen w-screen bg-gray-100 flex flex-col">
//       {/* Header Toolbar */}
//       <div className="h-16 bg-white shadow flex items-center justify-between px-6">
//         <div className="text-lg font-bold text-gray-800">DocSign - Document Viewer</div>
//         <button
//           onClick={() => navigate('/documents')}
//           className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
//         >
//           ← Back to Dashboard
//         </button>
//       </div>

//       {/* PDF Viewer container */}
//       <div
//         ref={viewerContainerRef}
//         className="flex-grow bg-white overflow-hidden"
//         style={{ height: 'calc(100vh - 4rem)' }} // 4rem for header height
//       >
//         <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
//           <Viewer
//             fileUrl={`http://localhost:8080/uploads/${id}`}
//             plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
//           />
//         </Worker>
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;











// import React from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// import { useParams, useNavigate } from 'react-router-dom';

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   return (
//     <div className="h-screen w-screen bg-gray-100 flex flex-col">
//       {/* Header Toolbar */}
//       <div className="h-16 bg-white shadow flex items-center justify-between px-6">
//         <div className="text-lg font-bold text-gray-800">DocSign - Document Viewer</div>
//         <button
//           onClick={() => navigate('/documents')}
//           className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
//         >
//           ← Back to Dashboard
//         </button>
//       </div>

//       {/* Main Viewer Section */}
//       <div className="flex flex-grow overflow-hidden">
//         <div className="flex-grow bg-white overflow-hidden">
//           <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
//             <Viewer
//         fileUrl={`http://localhost:8080/uploads/${id}`}
//         plugins={[defaultLayoutPluginInstance]}
//         />
//         </Worker>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;

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
  const fileUrl = `https://document-signature-app-server-hb3x.onrender.com/api/uploads/${filename}`;

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
      window.location.href = `https://document-signature-app-server-hb3x.onrender.com/api${genRes.data.url}`;
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












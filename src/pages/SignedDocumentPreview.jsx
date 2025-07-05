import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from '../utils/api';
import { FiDownload} from 'react-icons/fi';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function SignedDocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signedUrl, setSignedUrl] = useState("");
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    async function fetchSigned() {
      try {
        const res = await axios.get(`/docs/${id}`, { withCredentials: true });
        if (res.data.success && res.data.document.isSigned) {
          setSignedUrl(`https://document-signature-app-server-hb3x.onrender.com/api${res.data.document.signedFileUrl}`);
        } else {
          alert("Signed document not found.");
          navigate("/documents");
        }
      } catch (err) {
        console.error("Failed to fetch signed document:", err);
        navigate("/documents");
      }
    }
    fetchSigned();
  }, [id, navigate]);
  const handleDownloadSigned = async () => {
  try {
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error("Failed to download file");
    const blob = await response.blob();

    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = `signed-document-${Date.now()}.pdf`;
    downloadLink.click();

    window.URL.revokeObjectURL(downloadLink.href); // cleanup
  } catch (error) {
    console.error("Error downloading signed PDF:", error);
  }
};

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Signed Document Preview</h1>
         {signedUrl && (
  <div className="flex justify-end w-full mt-4">
    <button
      onClick={handleDownloadSigned}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      <FiDownload className="hover:text-green-600" />
    </button>
  </div>
)}
      {signedUrl ? (
        <div className="shadow-lg border rounded p-4 bg-white">
          <Document
            file={signedUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p>Loading signed PDF...</p>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
            ))}
          </Document>
        </div>
      ) : (
        <p>Loading signed document...</p>
      )}
   
    </div>
  );
}

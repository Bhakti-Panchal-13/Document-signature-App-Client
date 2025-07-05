
import React, { useEffect, useState } from 'react';
import axios from '../utils/api';
import LogoutButton from '../components/Logout';
import { Link, useNavigate } from 'react-router-dom';
import DocumentList from '../components/DocumentList';
import { FiUpload, FiCheckCircle, FiClock, FiFileText, FiDownload, FiTrash } from 'react-icons/fi';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('Loading...');
  const navigate = useNavigate();
 
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
    const fetchDocs = async () => {
      try {
        const res = await axios.get('/docs/all');
        if (res.data.success) setDocuments(res.data.documents);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchDocs();
  }, [location]);
  const handleDelete = async (documentId) => {
  if (!window.confirm("Are you sure you want to delete this document?")) return;

  try {
    const res = await axios.delete(`/docs/${documentId}`, {
      withCredentials: true,
    });

    if (res.data.success) {
      // Optionally show success message
      alert(res.data.message || "Document deleted successfully!");

      // Remove the document from local state so it disappears from UI:
      setDocuments((prevDocs) => prevDocs.filter(doc => doc._id !== documentId));
    } else {
      alert("Failed to delete the document.");
    }
  } catch (err) {
    console.error("Error deleting document:", err);
    alert("An error occurred while deleting the document.");
  }
};

  const totalDocs = documents.length;
  const signedDocs = documents.filter(doc => doc.isSigned).length;
  const pendingDocs = totalDocs - signedDocs;

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-purple-700">DocSign</h1>
        <div className="flex items-center gap-6">
          <p className="text-gray-700 text-sm">{userEmail}</p>
          <LogoutButton></LogoutButton>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Manage your documents and signatures</p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded shadow hover:opacity-90"
          >
            + Upload Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Documents</p>
              <p className="text-lg font-bold">{totalDocs}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Signed Documents</p>
              <p className="text-lg font-bold">{signedDocs}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-lg font-bold">{pendingDocs}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Your Documents */}
        <div className="bg-white rounded-xl shadow-lg">
          <h3 className="p-6 font-semibold text-lg border-b text-gray-800">Your Documents</h3>
          {loading ? (
            <p className="p-6 text-gray-500">Loading documents...</p>
          ) : filteredDocs.length === 0 ? (
            <p className="p-6 text-gray-500">No documents found.</p>
          ) : (
            filteredDocs.map(doc => {
              const fixedPath = doc.path.replace(/\\/g, '/'); // fix Windows paths
              const savedFilename = fixedPath.split('/').pop(); // get saved file name on disk
              const timestamp = Date.now();
              const signedFilename = `signed-${timestamp}-${savedFilename}`; 
              return (
                <div
                  key={doc._id}
                  className="flex justify-between items-center p-6 hover:bg-gray-50 transition-colors border-t"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded bg-${doc.isSigned ? 'green' : 'red'}-100 text-${doc.isSigned ? 'green' : 'red'}-600`}>
                      <FiFileText size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{doc.filename}</p>
                      <div className="flex items-center text-gray-500 text-sm gap-2">
                        <FiClock /> {new Date(doc.uploadedAt).toLocaleDateString()}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          doc.isSigned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {doc.isSigned ? 'Signed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 text-gray-600">
                    <Link to={`/preview/${doc._id}?filename=${encodeURIComponent(savedFilename)}`}>
                      <FiFileText className="hover:text-purple-600" />
                    </Link>
                
                  {/* {(doc.isSigned && doc.signedFileUrl) ? (
                        <a href={`https://document-signature-app-server-hb3x.onrender.com/api${doc.signedFileUrl}`} target="_blank" rel="noreferrer">
                          <FiDownload className="hover:text-green-600" />
                        </a>
                      ) : (
                        <FiClock className="text-gray-400" />
                      )}              */}
                      {(doc.isSigned && doc.signedFileUrl) ? (
                          <Link to={`/signed-preview/${doc._id}`}>
                            <FiDownload className="hover:text-green-600" />
                          </Link>
                        ) : (
                          <FiClock className="text-gray-400" />
                        )} 
                      <button onClick={() => handleDelete(doc._id)}>
                      <FiTrash className="hover:text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}


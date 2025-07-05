import React, { useEffect, useState } from 'react';
import axios from '../utils/api'; // axios with withCredentials: true
import { Link } from 'react-router-dom';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('/docs/all');
        if (res.data.success) {
          setDocuments(res.data.documents);
        } else {
          setMessage(res.data.message || 'No documents found.');
        }
      } catch (error) {
        console.error(error);
        setMessage('Failed to load documents.');
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">📄 Your Documents</h2>

      {message && <p className="text-red-600 mb-4">{message}</p>}

      <ul className="space-y-4">
        {documents.map((doc) => {
          const fixedPath = doc.path.replace(/\\/g, '/'); // Fix backslashes
          const filenameOnly = fixedPath.split('/').pop(); // Get filename

          return (
            <li
              key={doc._id}
              className="p-4 border rounded-md shadow-sm bg-white flex justify-between items-center"
            >
              <span className="font-medium text-gray-800">{doc.filename}</span>

              <div className="space-x-4">
                <a
                  href={`http://localhost:8080/${fixedPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>

                <Link
                  // to={`/preview/${filenameOnly}`}
                  to={`/preview/${doc._id}?filename=${filenameOnly}`}
                  className="text-purple-600 hover:underline"
                >
                  Preview
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DocumentList;

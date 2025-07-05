import React from "react";
import { Link } from 'react-router-dom';
import LogoutButton from '../components/Logout';
const Home = () => {
  
  return (
    <div className="bg-white text-gray-900">

            <header className="w-full bg-white shadow-md py-4 px-8 flex justify-between items-center fixed top-0">
        <h1 className="text-xl font-bold text-purple-700">DocSign</h1>
        <nav className="space-x-4">
          <Link to="/login" className="text-gray-700 hover:text-purple-700 font-medium">
            Login
          </Link>
          <Link to="/signup" className="text-gray-700 hover:text-purple-700 font-medium">
            Signup
          </Link>
           <LogoutButton></LogoutButton>
        </nav>
      </header>
      {/* Hero Section */}
      <section className="bg-gray-100 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Sign Documents Online for Free</h1>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          The simplest way to sign, send, and manage your documents digitally — secure, fast, and legally binding.
        </p>
        <div className="space-x-4">
           <Link
            to="/upload"
            className="bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-800 transition">
           Get Started Free
          </Link>
          <Link to="/documents" className="bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-800 transition">My Documents</Link>
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300">Contact Sales</button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-12">Why Choose DocSigner?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 border rounded shadow-sm">
            <img src="/icons/upload.svg" alt="Upload" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p>Upload PDFs and documents in one click and get them signed effortlessly.</p>
          </div>
          <div className="p-6 border rounded shadow-sm">
            <img src="/icons/secure.svg" alt="Secure" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">Secure & Legal</h3>
            <p>All signatures are legally binding and documents are securely stored.</p>
          </div>
          <div className="p-6 border rounded shadow-sm">
            <img src="/icons/send.svg" alt="Send" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">Send Anywhere</h3>
            <p>Send documents for signature to anyone, anywhere in the world instantly.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6">
            <img src="/icons/step1.svg" alt="Step 1" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">1. Upload</h3>
            <p>Choose a PDF or document to start the signing process.</p>
          </div>
          <div className="p-6">
            <img src="/icons/step2.svg" alt="Step 2" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">2. Sign</h3>
            <p>Add your eSignature using our simple drag-and-drop tool.</p>
          </div>
          <div className="p-6">
            <img src="/icons/step3.svg" alt="Step 3" className="mx-auto mb-4 w-16" />
            <h3 className="text-xl font-semibold mb-2">3. Send</h3>
            <p>Share the signed document with others via email or link.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} DocSigner. All rights reserved.</p>
          <div className="space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;









// import React from 'react';
// import { Link } from 'react-router-dom';

// function Home() {
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Navbar */}
//       <header className="w-full bg-white shadow-md py-4 px-8 flex justify-between items-center">
//         <h1 className="text-xl font-bold text-purple-700">DocSign</h1>
//         <nav className="space-x-4">
//           <Link to="/login" className="text-gray-700 hover:text-purple-700 font-medium">
//             Login
//           </Link>
//           <Link to="/signup" className="text-gray-700 hover:text-purple-700 font-medium">
//             Signup
//           </Link>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
//         <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Digitally Sign Your Documents Effortlessly</h2>
//         <p className="text-gray-600 mb-6 max-w-2xl">
//           DocSign helps you sign, send, and manage documents securely and quickly — all online. Get started in seconds!
//         </p>
//         <div className="space-x-4">
//           <Link
//             to="/signup"
//             className="bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-800 transition"
//           >
//             Get Started
//           </Link>
//           <Link
//             to="/login"
//             className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-300 transition"
//           >
//             Login
//           </Link>
//            <Link
//             to="/upload"
//             className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-300 transition"
//           >
//             Upload File
//           </Link>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-white shadow-inner text-center py-4 text-sm text-gray-500">
//         © {new Date().getFullYear()} DocSign. All rights reserved.
//       </footer>
//     </div>
//   );
// }

// export default Home;


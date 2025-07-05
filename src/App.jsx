import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import 'react-toastify/dist/ReactToastify.css';
import {Routes, Route, Navigate} from 'react-router-dom'
import SignUp from './pages/signUp'
import Login from './pages/login'
import Home from './pages/home'
import Upload from './pages/upload';
import DocumentList from './components/DocumentList';
import ProtectedRoute from './components/ProtectedRoute';
import DocumentPreview from './pages/DocumentPreview';
import DocumentDashboard from './pages/DocumentDashboard';
import SignedDocumentPreview from './pages/SignedDocumentPreview';



function App() {
  

  return (
    <>
      {/* <h1 class="text-3xl font-bold text-blue-400">
    Hello world!</h1> */}
    <Routes>
      <Route path='/' element={<Navigate to= "/login"/>}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<SignUp />}/>
      <Route path='/home' element={<Home />}/>
      <Route path="/documents" element={<ProtectedRoute> <DocumentDashboard /></ProtectedRoute>} />
      <Route path="/preview/:id" element={<DocumentPreview />} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/signed-preview/:id" element={<SignedDocumentPreview />} />
    </Routes>
      
  
    </>
  )
}

export default App

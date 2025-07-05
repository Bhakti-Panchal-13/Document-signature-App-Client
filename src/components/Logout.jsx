import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to log out');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 font-medium"
    >
      Logout
    </button>
    
  );
}

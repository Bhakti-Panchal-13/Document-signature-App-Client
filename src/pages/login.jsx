
import React, { useState } from 'react';
import { Link, useNavigate , useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from '../utils/utilserror';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || '/upload'; // fallback to /upload

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError('Email and password are required');
    }

    try {
      const url = `http://localhost:8080/api/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Important for sending and storing HttpOnly cookie
        body: JSON.stringify(loginInfo)
      });

      const result = await response.json();
      const { success, message, jwtToken, name, error } = result;

      if (success) {
        handleSuccess(message);
        // localStorage.setItem('token', jwtToken);
        // localStorage.setItem('loggedInUser', name);
        login({ name, email }); // ✅ Update context with user info
        console.log('Success login ✅');
        // navigate to home
        navigate('/home'); // ✅ Navigate instantly
      
      } else if (error) {
        const details = error?.details[0]?.message || 'Something went wrong';
        handleError(details);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError(err.message || 'An unexpected error occurred');
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-[8px_8px_30px_0px_rgba(66,60,90,1)] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label >
            <input
              onChange={handleChange}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email..."
              value={loginInfo.email}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password..."
              value={loginInfo.password}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-800 transition duration-300 cursor-pointer"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;

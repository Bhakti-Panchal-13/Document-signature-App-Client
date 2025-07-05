import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { handleError, handleSuccess } from '../utils/utilserror';

function SignUp() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

console.log('SignUp Info',signupInfo)

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError('name, email and password are required');
    }

    try {
      const url = `http://localhost:8080/api/auth/signup`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupInfo)
      });

      const result = await response.json();
      console.log(result);
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else if (error) {
        const details = error?.details[0]?.message || "Signup failed";
        handleError(details);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-[8px_8px_30px_0px_rgba(66,60,90,1)] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              id="name"
              autoFocus
              value={signupInfo.name}
              placeholder="Enter your name..."
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              id="email"
              value={signupInfo.email}
              placeholder="Enter your email..."
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              id="password"
              value={signupInfo.password}
              placeholder="Enter your password..."
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none "
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-800 transition-colors duration-300 cursor-pointer"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}

export default SignUp;

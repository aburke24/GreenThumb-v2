// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { registerApi } from '../utils/authUtil';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
         console.log("HEre");
    try {
        console.log("HEre");
     const response = await registerApi(username, email, password);
      // Optionally, you could auto-login or redirect
      console.log(response);
      alert('Registration successful! Please login.');
      navigate('/');  // Redirect to login page after successful signup
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-garden-green font-inter">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-soil-brown text-center mb-8 tracking-wide">Sign Up</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent placeholder-gray-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent placeholder-gray-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent placeholder-gray-400 transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-accent-blue py-3 px-6 rounded-lg font-medium border-2 border-accent-blue hover:bg-accent-blue hover:text-white transition-all"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;

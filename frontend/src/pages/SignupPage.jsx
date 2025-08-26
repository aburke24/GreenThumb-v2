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
      navigate('/');  
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-800 flex items-center justify-center p-4 font-inter antialiased">
        <div className="w-full max-w-sm bg-neutral-900 p-8 rounded-xl shadow-xl border border-neutral-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Sign Up</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 transition"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            <div className="flex flex-col space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-neutral-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-neutral-600 transition"
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

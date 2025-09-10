// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { registerApi } from '../utils/authUtil';
import { useNavigate } from 'react-router-dom';

/**
 * SignUpPage component allows a user to register for a new account.
 * It provides a form to input a username, email, and password.
 * It handles the registration process, including API calls, and
 * navigates the user after a successful registration.
 */
const SignUpPage = () => {
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // State for the form input fields.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for displaying error messages and showing a loading indicator.
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for user registration.
   * It prevents the default form action, clears previous errors,
   * sets the loading state, and calls the registration API.
   * On success, it shows an alert and navigates to the login page.
   * On failure, it sets an error message.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
      
    try {
      await registerApi(username, email, password);
      console.log('Registration successful!');
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
            {/* Conditional rendering of the error message. */}
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
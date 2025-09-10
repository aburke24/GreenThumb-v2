import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../utils/authUtil';
import { useUser } from '../hooks/UserUser'; 
import logo from '../assets/GreenThumbLogo.svg'

/**
 * LoginPage component for user authentication.
 * It provides a form for users to log in with their email and password.
 * It also handles navigation and displays loading and error states.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading, login } = useUser();

  const navigate = useNavigate();

  /**
   * useEffect hook to handle automatic redirection.
   * If a user is already authenticated and not in a loading state,
   * it navigates them directly to the home page.
   */
  useEffect(() => {
    if (user && !userLoading) {
      navigate('/home');
    }
  }, [user, userLoading, navigate]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(email, password);
      const { token, user: userData } = response;

      if (token && userData) {
        await login(userData, token);
        navigate('/home');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Displays a loading message while the user is being authenticated.
  if (userLoading || loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-neutral-800 flex items-center justify-center font-inter antialiased">
        <div className="max-w-md w-full bg-neutral-900 p-8 rounded-xl shadow-xl border border-neutral-700">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Green Thumb Logo" className="h-40 w-auto" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 transition"
              />
            </div>
            {/* Display error message if it exists. */}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex justify-between items-center space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('signup')}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-neutral-600 transition"
              >
                Sign Up
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Log In' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default LoginPage;
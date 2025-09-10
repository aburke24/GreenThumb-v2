import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../utils/authUtil';
import { useUser } from '../hooks/UserUser';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loading: userLoading, login } = useUser();

  // Redirect if already logged in
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
      // The loginApi should return both the token AND the user object
      const response = await loginApi(email, password);
      const { token, user: userData } = response; // Destructure token and user data from the response

      if (token && userData) {
        // Pass the full user object to the context login function
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

  if (userLoading || loading) return <p>Loading...</p>;

  return (
   <div className="min-h-screen bg-neutral-800 flex items-center justify-center font-inter antialiased">
  <div className="relative max-w-md w-full flex flex-col items-center">

    {/* ✅ Logo - floating just above the card */}
    {/* Updated logo to be larger and without the circular background */}
    <div className="absolute -top-12">
      <img
        src="/assets/GreenThumbLogo.svg"
        alt="Green Thumb Logo"
        className="w-40 h-auto"
      />
    </div>

    {/* 🔳 Login Card */}
    <div className="w-full bg-neutral-900 p-8 pt-20 rounded-xl shadow-xl border border-neutral-700">

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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
     </div>
  );
};

export default LoginPage;

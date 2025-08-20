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
  const { user, loading: userLoading, login } = useUser();  // Grab login & user from context

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
        alert('Login successful!');
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
    <div className="min-h-screen bg-garden-green flex items-center justify-center font-inter">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-soil-brown text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-soil-brown">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-soil-brown">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="bg-gray-200 text-soil-brown py-2 px-4 rounded-md hover:bg-gray-300 transition"
            >
              Sign Up
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

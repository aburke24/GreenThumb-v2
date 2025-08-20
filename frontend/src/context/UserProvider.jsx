// UserProvider.jsx
import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext'; // import the context separately
import { fetchUserByEmailApi } from '../utils/userUtil';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, token) => {
    try {
      setLoading(true);

      // Save token and expiration
      const expirationTime = Date.now() + 3600 * 1000;
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiration', expirationTime.toString());

      // Fetch user profile by email
      const basicUser = await fetchUserByEmailApi(email);
      if (basicUser?.id) {
        setUser(basicUser);
      } else {
        throw new Error('User profile not found.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    console.log('Logged out successfully.');
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');

      if (token && tokenExpiration && Date.now() < parseInt(tokenExpiration)) {
        // Example email — replace with real data or decode token for email
        const userEmail = 'newuser@example.com';
        await login(userEmail, token);
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const value = { user, loading, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

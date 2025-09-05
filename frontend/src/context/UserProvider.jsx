import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { fetchUserApi } from '../utils/userUtil';



export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);


  const login = async (user, token) => { 
    try {
      setLoading(true);
      const expirationTime = Date.now() + 3600 * 1000;
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiration', expirationTime.toString());
      localStorage.setItem('userId', user.id);

      const fullUserData = await fetchUserApi(user.id);
  
      setUserData(fullUserData);
    } catch (error) {
      console.error('Login failed:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userId');
    console.log('Logged out successfully.');
  };

  const refreshUserData = async () => {
    // Check for `userData.id` to ensure a user is loaded
    if (!userData || !userData.id) {
      console.log("Cannot refresh data: user is not logged in.");
      return;
    }
    try {
      setLoading(true);
      const fullUserData = await fetchUserApi(userData.id);
      setUserData(fullUserData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const storedUserId = localStorage.getItem('userId');

      if (token && tokenExpiration && Date.now() < parseInt(tokenExpiration) && storedUserId) {
        try {
          const fullUserData = await fetchUserApi(storedUserId);
          console.log("The user data is ", userData);
          setUserData(fullUserData);
        } catch (error) {
          console.error("Failed to restore user session:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const value = {
    userData,
    loading,
    setLoading,
    login,
    logout,
    refreshUserData,
  
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
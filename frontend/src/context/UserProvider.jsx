import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { fetchUserApi } from '../utils/userUtil';
import { getBedsApi,getBedByIdApi  } from '../utils/bedUtil';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [gardens, setGardens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState({});
  const [bed,setBed] = useState(null);

  // The login function now takes the full user object directly
  const login = async (userData, token) => {
    try {
      setLoading(true);

      // Save token and expiration
      const expirationTime = Date.now() + 3600 * 1000;
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiration', expirationTime.toString());

      // Fetch the full user data again to ensure we get the latest gardens.
      const fullUserData = await fetchUserApi(userData.id);
      console.log("Setting user info:", fullUserData);

      setUser(fullUserData);
      setGardens(fullUserData.gardens);

    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setGardens(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setGardens(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    console.log('Logged out successfully.');
  };

    const refreshGardens = async () => {
    if (!user || !user.id) {
      console.log("Cannot refresh gardens: user is not logged in.");
      return;
    }
    try {
      setLoading(true);
      const fullUserData = await fetchUserApi(user.id);
      setGardens(fullUserData.gardens);
    } catch (error) {
      console.error('Failed to refresh gardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBeds = async (gardenId) => {
  if (!user || !user.id || !gardenId) return;

  try {
    setLoading(true);
    const bedsData = await getBedsApi(user.id, gardenId);
    setBeds(prev => ({
      ...prev,
      [gardenId]: bedsData
    }));
  } catch (error) {
    console.error('Failed to refresh beds:', error);
  } finally {
    setLoading(false);
  }
};

 const refreshBed = async (gardenId, bedId) => {
    if (!user || !user.id || !gardenId || !bedId) {
      console.log("UserProvider: Cannot refresh single bed, missing user, garden, or bed ID.");
      return;
    }
    try {
      setLoading(true);
      console.log(`UserProvider: Attempting to fetch bed with ID ${bedId} from garden ${gardenId}`);
      const bedData = await getBedByIdApi(user.id, gardenId, bedId);
      console.log("UserProvider: Single bed data fetched:", bedData);
      setBed(bedData);
    } catch (error) {
      console.error('Failed to refresh beds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');

      if (token && tokenExpiration && Date.now() < parseInt(tokenExpiration)) {
        // Assume you have a way to get the user ID from a decoded token or localStorage
        // For now, we'll fetch from the API to get the latest gardens.
        // This is a more robust way to handle session restoration.
        try {
          // This line assumes you store the user's ID in local storage on initial login.
          // You will need to implement this part in your LoginPage.
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            const fullUserData = await fetchUserApi(storedUserId);
            setUser(fullUserData);
            setGardens(fullUserData.gardens);
          }
        } catch (error) {
          console.error("Failed to restore user session:", error);
          setUser(null);
          setGardens(null);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []); // Empty dependency array means this runs only once on mount

  const value = { user, userId: user?.id, gardens, loading, login, logout, refreshGardens, refreshBeds, beds,refreshBed, bed };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

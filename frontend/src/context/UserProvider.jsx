import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { fetchUserApi } from '../utils/userUtil';
import { getBedsApi, getBedByIdApi } from '../utils/bedUtil';
import { getPlantsApi } from '../utils/plantsUtil';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [gardens, setGardens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState({});
  const [bed, setBed] = useState(null);
  const [plants, setPlants] = useState([]);

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

  const getGarden = (gardenId) => {
  const foundGarden = user.gardens.find(garden => {
    return garden.id == gardenId;
  });

  if (!foundGarden) {
    console.error(`Garden with ID ${gardenId} not found.`);
    return null;
  }

  return foundGarden;
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

  const refreshPlants = async (gardenId, bedId) => {
    if (!user || !user.id || !gardenId || !bedId) {
      console.log("UserProvider: Cannot refresh single bed, missing user, garden, or bed ID.");
      return;
    }
    try {
      setLoading(true);
      console.log(`UserProvider: Attempting to fetch bed with ID ${bedId} from garden ${gardenId}`);
      const plantData = await getPlantsApi(user.id, gardenId, bedId);
      console.log("UserProvider: Single bed data fetched:", plantData);
      setPlants(plantData);
    } catch (error) {
      console.error('Failed to refresh beds:', error);
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');

      if (token && tokenExpiration && Date.now() < parseInt(tokenExpiration)) {
        try {
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
  }, []);

  // values needed elsewhere
  const value = { user, userId: user?.id, gardens, getGarden, loading, login, logout, refreshGardens, refreshBeds, beds, refreshBed, bed, refreshPlants, plants, setPlants, setBed, bedId: bed?.id };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

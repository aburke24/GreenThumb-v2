import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { fetchUserApi } from '../utils/userUtil';
import { getBedsApi } from '../utils/bedUtil';
import { getPlantsApi } from '../utils/plantsUtil';


export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gardens, setGardens] = useState([]);
  const [beds, setBeds] = useState({}); 
  const [plants, setPlants] = useState({});

  const login = async (user, token) => { // Renamed userData to user to avoid confusion
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

const refreshGardens = async () => {
    // Check for userData to ensure a user is logged in
    if (!userData || !userData.id) {
      console.log("Cannot refresh gardens: user is not logged in.");
      return;
    }
    try {
      setLoading(true);
      const fullUserData = await fetchUserApi(userData.id);
      // Update the gardens state with the new data from the API
      setGardens(fullUserData.gardens); 
    } catch (error) {
      console.error('Failed to refresh gardens:', error);
    } finally {
      setLoading(false);
    }
  };

 const refreshBeds = async (gardenId) => {
    if (!userData || !userData.id || !gardenId) return;

    try {
      setLoading(true);
      const bedsData = await getBedsApi(userData.id, gardenId);
      // Use the functional form of setState to preserve other gardens' beds
      setBeds(prevBeds => ({
        ...prevBeds,
        [gardenId]: bedsData // Update the beds for the specific gardenId
      }));
    } catch (error) {
      console.error('Failed to refresh beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBed = async (gardenId, bedId) => {
    if (!userData || !userData.id || !gardenId || !bedId) return;
    try {
      setLoading(true);
      const bedsData = await getBedsApi(userData.id, gardenId);
      const updatedBeds = bedsData.find(bed => bed.id === bedId);
      
      // Update the beds object with the new data
      setBeds(prevBeds => ({
        ...prevBeds,
        [gardenId]: updatedBeds
      }));
    } catch (error) {
      console.error('Failed to refresh single bed:', error);
    } finally {
      setLoading(false);
    }
};

const refreshPlants = async (gardenId, bedId) => {
    if (!userData || !userData.id || !gardenId || !bedId) return;
    try {
      setLoading(true);
      const plantData = await getPlantsApi(userData.id, gardenId, bedId);
      // Update the plants object with the new data for the specific bed
      setPlants(prevPlants => ({
        ...prevPlants,
        [bedId]: plantData
      }));
    } catch (error) {
      console.error('Failed to refresh plants:', error);
    } finally {
      setLoading(false);
    }
};

const getUserId = () =>{
  console.log("UserData", userData);
  return userData.id;
}

  // Utility functions that now rely on the local state
  const getGarden = (gardenId) => {
    if (!userData) return null;
    // Ensure strict equality with `===` and handle potential string/number mismatches
    return userData.gardens.find(garden => garden.id == gardenId);
  };

  const getBedsForGarden = (gardenId) => {
    const garden = getGarden(gardenId);
    if (!garden) {
      console.log(`No garden found with ID: ${gardenId}. Returning empty array.`);
      return [];
    }
    return garden.beds;
  };

  const getBed = (gardenId, bedId) => {
    const beds = getBedsForGarden(gardenId);
    if (!beds) return null;
    // Find the bed within the beds array
    return beds.find(bed => bed.id == bedId);
  }

  const getBedPlants = (gardenId, bedId) => {
    const bed = getBed(gardenId, bedId);
    return bed ? bed.plants : [];
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
    getUserId,
    login,
    logout,
    refreshUserData,
    refreshGardens,
    refreshBeds,
    refreshBed,
    refreshPlants,
    getGarden,
    getBedsForGarden,
    getBed,
    getBedPlants,
    gardens,
    beds,
    plants
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
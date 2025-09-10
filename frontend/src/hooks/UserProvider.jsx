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
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            console.log("Cannot refresh data: user is not logged in.");
            return;
        }
        try {
            setLoading(true);
            const fullUserData = await fetchUserApi(storedUserId);
            setUserData(fullUserData);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Optionally, log the user out if the token is invalid
            if (error.response && error.response.status === 401) {
                logout();
            }
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

            // Check if token exists, hasn't expired, and userId is present
            if (token && tokenExpiration && Date.now() < parseInt(tokenExpiration) && storedUserId) {
                try {
                    const fullUserData = await fetchUserApi(storedUserId);
                    setUserData(fullUserData);
                } catch (error) {
                    console.error("Failed to restore user session:", error);
                    setUserData(null);
                    localStorage.clear(); // Clear local storage on failure to prevent future attempts with an invalid token
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                localStorage.clear(); // Clear invalid or expired session data
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
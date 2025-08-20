// src/utils/auth.js

const API_URL = import.meta.env.BACKEND_URL;

/**
 * Utility function to handle the login API call.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves with the login response data.
 */
const loginApi = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    console.log(response);
    if (!response.ok) {
      let errorMessage = 'Login failed';

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return {}; 
    }

  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};


/**
 * Utility function to handle the registration API call.
 * @param {string} username - The user's desired username.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves with the registration response data.
 */
const registerApi = async (username, email, password) => {
  try {
    console.log("made it");
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = 'Registration failed';

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return {}; 
    }

  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};


export {
  loginApi,
  registerApi
};
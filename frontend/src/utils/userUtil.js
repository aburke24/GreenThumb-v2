/**
 * A utility file to handle all user-related API calls.
 * This approach centralizes user data logic, keeping components clean.
 */

const API_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetches user data from the backend by userId.
 *
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<object>} The user's data.
 */
async function fetchUserApi(userId) {
    try {
              const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/user/userId?userId=${userId}`;

        const response = await fetch(apiUrl, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const userData = await response.json();
        return userData;

    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; 
    }
}

/**
 * Fetches user data from the backend by email.
 * @param {string} email - The user's email.
 * @returns {Promise<object>} The user's data.
 */
const fetchUserByEmailApi = async (email) => {
  try {
    const response = await fetch(`${API_URL}/user/email?email=${encodeURIComponent(email)}`);

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch user data by email.';
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
 * Updates a user's information.
 * @param {string} userId - The ID of the user to update.
 * @param {object} newData - An object containing the data to update (e.g., { username: 'New Name' }).
 * @returns {Promise<object>} A promise that resolves with the updated user object from the server.
 */
export async function updateUserApi(userId, newData) {
  try {
    const response = await fetch(`${API_URL}/user/userId?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Deletes a user by email.
 * @param {string} email - The email of the user to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export async function deleteUserByEmailApi(email) {
  try {
    const response = await fetch(`${API_URL}/user/email?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}


export{
    fetchUserApi,
    fetchUserByEmailApi
}
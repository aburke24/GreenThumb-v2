/**
 * A utility file to handle all user-related API calls.
 * This approach centralizes user data logic, keeping components clean.
 */

// Define the base URL for your API.
const API_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetches user data from the backend by userId.
 *
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<object>} The user's data.
 */
async function fetchUserApi(userId) {
    try {
        // Construct the URL with the userId as a query parameter, matching the curl command.
        // It's crucial that the environment variable is named VITE_BACKEND_URL in your .env file
        // and your server is running.
        
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/user/userId?userId=${userId}`;

        const response = await fetch(apiUrl, {
            method: 'GET', // The GET method is the default, but it's good practice to specify it.
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const userData = await response.json();
        return userData;

    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

const fetchUserByEmailApi = async (email) => {
  try {
    // We use encodeURIComponent to properly format the email for a URL query parameter.
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

export{
    fetchUserApi,
    fetchUserByEmailApi
}
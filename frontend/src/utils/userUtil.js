/**
 * A utility file to handle all user-related API calls.
 * This approach centralizes user data logic, keeping components clean.
 */

// Define the base URL for your API.
const API_URL = "http://localhost:3001/api";

const fetchUserApi = async (userId) =>{
    try{
        const response = await fetch(`${API_URL}/user/${userId}`);

        const contentType = response.headers.get("content-type");

        if(!response.ok){
            let errorMessage = 'Failed to fetch user data.';

            if(contentType && contentType.includes("application/json")){
                const errorData = await response.json();
                errorMessage = errorData.essage || errorMessage;
            }else{
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        if(contentType && contentType.includes("application/json")){
            return await response.json();
        }else{
            return{};
        }
    }catch(error){
        console.error('API call failed:', error);
        throw error;
    }
};

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
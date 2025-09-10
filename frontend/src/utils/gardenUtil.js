const API_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Creates a new garden record in the database.
 * @param {string} userId - The ID of the user creating the garden.
 * @param {string} garden_name - The name of the new garden.
 * @param {number} width - The width of the garden.
 * @param {number} height - The height of the garden.
 * @returns {Promise<object>} A promise that resolves with the newly created garden object from the server.
 */
const createGardenApi = async(userId, garden_name, width, height) =>{
  try {
    const response = await fetch(`${API_URL}/gardens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, garden_name, width, height }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create garden');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating garden:', error);
    throw error;
  }
}

/**
 * Fetches a single garden by its ID and a user's ID.
 * @param {string} userId - The ID of the user who owns the garden.
 * @param {string} gardenId - The ID of the garden to fetch.
 * @returns {Promise<object>} A promise that resolves with the garden object.
 */
const getGardenApi = async(userId, gardenId) =>{
  try {
    const response = await fetch(`${API_URL}/gardens?userId=${userId}&gardenId=${gardenId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch garden');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching garden:', error);
    throw error;
  }
}

/**
 * Updates a garden record by its ID.
 * @param {string} userId - The ID of the user who owns the garden.
 * @param {string} gardenId - The ID of the garden to update.
 * @param {object} newData - An object containing the data to update (e.g., { garden_name: 'New Name' }).
 * @returns {Promise<object>} A promise that resolves with the updated garden object from the server.
 */
const updateGardenApi = async (userId, gardenId, newData) => {
  try {
    console.log("The gardens info is ", userId, gardenId, newData);
    const response = await fetch(`${API_URL}/gardens?userId=${userId}&gardenId=${gardenId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update garden');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating garden:', error);
    throw error;
  }
}

/**
 * Deletes a garden by its ID.
 * @param {string} userId - The ID of the user who owns the garden.
 * @param {string} gardenId - The ID of the garden to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
const deleteGardenApi = async (userId, gardenId)=> {
  try {
    const response = await fetch(`${API_URL}/gardens?userId=${userId}&gardenId=${gardenId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete garden');
    }

  } catch (error) {
    console.error('Error deleting garden:', error);
    throw error;
  }
}

export{
  createGardenApi,
  getGardenApi,
  deleteGardenApi,
  updateGardenApi
}
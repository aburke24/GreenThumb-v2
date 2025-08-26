const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetches all plants for a specific user, garden, and bed.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden the bed belongs to.
 * @param {string} bedId - The ID of the bed to get plants from.
 * @returns {Promise<Array<object>>} The list of plants from the database.
 */
export const getPlantsApi = async (userId, gardenId, bedId) => {
    console.log(`Fetching plants for bed ${bedId} in garden ${gardenId} for user ${userId}...`);
    try {
        const response = await fetch(
            `${BASE_URL}/plants/all-plants?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
       
        const plants = await response.json();
        console.log("THE RESPONSE IS ", plants);
        return plants;
    } catch (error) {
        console.error('Failed to fetch plants:', error);
        throw error;
    }
};

/**
 * Saves (updates) the list of plants in a specific bed for a given user and garden.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden the bed belongs to.
 * @param {string} bedId - The ID of the bed to update plants in.
 * @param {Array<object>} plants - Array of plant objects to be saved (each with id, plant_id, x_position, y_position, plant_role).
 * @returns {Promise<Array<object>>} The updated list of plants.
 */
export const updatePlantsApi = async (userId, gardenId, bedId, plants) => {
  console.log(`Updating plants in bed ${bedId} of garden ${gardenId} for user ${userId}...`);
  try {
    console.log("The data we are updateing is ", plants)
    const response = await fetch(
      `${BASE_URL}/plants/save-plants?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`,
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plants),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const updatedPlants = await response.json();
    return updatedPlants;
  } catch (error) {
    console.error('Failed to update plants:', error);
    throw error;
  }
};

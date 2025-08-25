const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
    const response = await fetch(
      `${BASE_URL}/plants/save-plants?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`,
      {
        method: 'POST', // Assuming the API expects POST for updating plants
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

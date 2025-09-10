// bedUtil.js
// This utility file contains functions to interact with the bed-related API endpoints.
// It uses the native fetch API to make asynchronous HTTP requests.

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Creates a new bed in a specific garden.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden where the bed will be created.
 * @param {object} bedData - The data for the new bed (e.g., name, width, height, position).
 * @returns {Promise<object>} A promise that resolves with the data of the newly created bed.
 */
const createBedApi = async (userId, gardenId, bedData) => {
  console.log(`Creating bed in garden ${gardenId} for user ${userId}...`);
  try {
    const payload = {
      garden_id: gardenId,
      name: bedData.name,
      width: bedData.width,
      height: bedData.height,
      top_position: bedData.top_position,
      left_position: bedData.left_position,
    };
    const response = await fetch(`${BASE_URL}/beds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const newBed = await response.json();
    return newBed;
  } catch (error) {
    console.error('Failed to create bed:', error);
    throw error;
  }
};

/**
 * Fetches all beds for a specific user and garden.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden to fetch beds from.
 * @returns {Promise<Array<object>>} A promise that resolves with a list of beds.
 */
const getBedsApi = async (userId, gardenId) => {
  console.log(`Fetching all beds for garden ${gardenId} of user ${userId}...`);
  try {
    const response = await fetch(`${BASE_URL}/beds?userId=${userId}&gardenId=${gardenId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const beds = await response.json();
    return beds;
  } catch (error) {
    console.error('Failed to fetch beds:', error);
    throw error;
  }
};

/**
 * Fetches a single bed for a specific user, garden, and bed ID.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed to fetch.
 * @returns {Promise<object>} A promise that resolves with the data of the requested bed.
**/
const getBedByIdApi = async (userId, gardenId, bedId) => {
  console.log(`Fetching bed ${bedId} from garden ${gardenId} for user ${userId}...`);
  try {
    const response = await fetch(`${BASE_URL}/beds?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const bed = await response.json();
    return bed;
  } catch (error) {
    console.error(`Failed to fetch bed with ID ${bedId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing bed.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden the bed belongs to.
 * @param {string} bedId - The ID of the bed to update.
 * @param {object} updateData - The data to update the bed with.
 * @returns {Promise<object>} A promise that resolves with the data of the updated bed.
 */
 const updateBedApi = async (userId, gardenId, bedId, updateData) => {
  console.log(`Updating bed ${bedId} in garden ${gardenId} for user ${userId}...`);
  try {
    const response = await fetch(`${BASE_URL}/beds?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const updatedBed = await response.json();
    return updatedBed;
  } catch (error) {
    console.error(`Failed to update bed with ID ${bedId}:`, error);
    throw error;
  }
};

/**
 * Deletes a bed from a specific garden.
 * @param {string} userId - The ID of the current user.
 * @param {string} gardenId - The ID of the garden the bed belongs to.
 * @param {string} bedId - The ID of the bed to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
const deleteBedApi = async (userId, gardenId, bedId) => {
  console.log(`Deleting bed ${bedId} from garden ${gardenId} for user ${userId}...`);
  try {
    const response = await fetch(`${BASE_URL}/beds?userId=${userId}&gardenId=${gardenId}&bedId=${bedId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to delete bed with ID ${bedId}:`, error);
    throw error;
  }
};

export {
  createBedApi,
  getBedsApi,
  getBedByIdApi,
  updateBedApi,
  deleteBedApi
};
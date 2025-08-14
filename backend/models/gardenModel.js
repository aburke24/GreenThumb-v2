/**
 * @file models/gardenModel.js
 * @description Handles all database interactions for the garden resource.
 */

const { pool } = require('../db');

/**
 * Retrieves all gardens for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} An array of garden objects.
 */
async function findGardensByUserId(userId) {
    try {
        const query = 'SELECT id, garden_name, width, height, is_active FROM gardens WHERE user_id = $1;';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error('Database error in userModel.findGardensByUserId:', error);
        throw error;
    }
}

module.exports = {
    findGardensByUserId
};
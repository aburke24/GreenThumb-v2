/**
 * @file models/bedModel.js
 * @description Handles all database interactions for the garden bed resource.
 */
const { pool } = require('../db');

/**
 * Retrieves all garden beds and their associated plants for a specific garden.
 * This function has been updated to use the plants_in_beds junction table.
 * @param {string} gardenId - The ID of the garden.
 * @returns {Promise<Array>} An array of garden bed objects, each with a 'plants' array.
 */
async function findGardenBedsAndPlantsByGardenId(gardenId) {
    try {
        // Step 1: Get all garden beds for the specified garden.
        const bedsQuery = `
            SELECT id, top_position, left_position, width, height
            FROM garden_beds
            WHERE garden_id = $1;
        `;
        const { rows: beds } = await pool.query(bedsQuery, [gardenId]);

        // Step 2: For each bed, get its plants using the junction table.
        for (const bed of beds) {
            const plantsQuery = `
                SELECT 
                    p.id, 
                    pib.plant_role,
                    pib.planted_date,
                    pib.x_position,
                    pib.y_position
                FROM plants_in_beds pib
                INNER JOIN plants p ON pib.plant_id = p.id
                WHERE pib.bed_id = $1;
            `;
            const { rows: plants } = await pool.query(plantsQuery, [bed.id]);
            bed.plants = plants; // Attach the list of plants to the current bed object
        }

        return beds;
    } catch (error) {
        console.error('Database error in userModel.findGardenBedsAndPlantsByGardenId:', error);
        throw error;
    }
}

module.exports = {
    findGardenBedsAndPlantsByGardenId
};
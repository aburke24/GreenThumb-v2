/**
 * @file models/plantModel.js
 * @description Handles all database interactions for the plants_in_beds resource and the plants catalog.
 */

//Imports
const { pool } = require('../db');

/**
 * Saves an entire array of plants to a bed in a single transaction.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed.
 * @param {Array<Object>} plantsArray - An array of plant objects to save.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function savePlantsInBed(userId, gardenId, bedId, plantsArray) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Validate the bed exists and belongs to the user
        const bedCheckQuery = `
            SELECT gb.id FROM garden_beds gb
            JOIN gardens g ON gb.garden_id = g.id
            WHERE g.user_id = $1 AND g.id = $2 AND gb.id = $3;
        `;
        const { rows: bedRows } = await client.query(bedCheckQuery, [userId, gardenId, bedId]);
        if (bedRows.length === 0) {
            throw new Error('Validation error: Bed does not exist or does not belong to the user/garden.');
        }

        // Step 2: Delete all existing plants for the bed
        const deleteQuery = 'DELETE FROM plants_in_beds WHERE bed_id = $1;';
        await client.query(deleteQuery, [bedId]);

        // Step 3: Insert all new plants from the array
        const insertQuery = `
            INSERT INTO plants_in_beds (bed_id, plant_id, planted_date, x_position, y_position, plant_role)
            VALUES ($1, $2, NOW(), $3, $4, $5);
        `;
        for (const plant of plantsArray) {
            await client.query(insertQuery, [
                bedId,
                plant.plant_id,
                plant.x_position,
                plant.y_position,
                plant.plant_role
            ]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error in plantModel.savePlantsInBed:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Gets all plants for a specific bed, including catalog data and icon image.
 * This function performs a JOIN to get the common_name and icon_image from the plants table.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed.
 * @returns {Promise<Array<Object>>} An array of plant objects.
 */
async function getPlantsForBed(userId, gardenId, bedId) {
    try {
        const plantQuery = `
            SELECT
                pb.id AS plant_in_bed_id,
                pb.bed_id,
                pb.plant_id,
                pb.planted_date,
                pb.x_position,
                pb.y_position,
                pb.plant_role,
                p.common_name,
                p.scientific_name,
                p.icon_image,
                p.spacing
            FROM plants_in_beds pb
            JOIN garden_beds gb ON pb.bed_id = gb.id
            JOIN gardens g ON gb.garden_id = g.id
            JOIN plants p ON pb.plant_id = p.id
            WHERE g.user_id = $1 AND g.id = $2 AND gb.id = $3;
        `;
        const { rows } = await pool.query(plantQuery, [userId, gardenId, bedId]);
        return rows;
    } catch (error) {
        console.error('Database error in plantModel.getPlantsForBed:', error);
        throw error;
    }
}

/**
 * Gets all plants from the catalog.
 * @returns {Promise<Array<Object>>} An array of plant objects.
 */
async function getAllPlants() {
    try {
        const plantQuery = 'SELECT * FROM plants;';
        const { rows } = await pool.query(plantQuery);
        return rows;
    } catch (error) {
        console.error('Database error in plantModel.getAllPlants:', error);
        throw error;
    }
}

/**
 * Gets a single plant from the catalog by its ID.
 * @param {string} plantId - The ID of the plant.
 * @returns {Promise<Object|null>} The plant object or null if not found.
 */
async function getPlantById(plantId) {
    try {
        const plantQuery = 'SELECT * FROM plants WHERE id = $1;';
        const { rows } = await pool.query(plantQuery, [plantId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in plantModel.getPlantById:', error);
        throw error;
    }
}

/**
 * Deletes all plant-to-bed associations for a given bed ID.
 * @param {number} bedId - The ID of the bed.
 * @returns {Promise<number>} The number of deleted associations.
 */
async function removeByBedId(bedId) {
    try {
        // ✅ The table name has been corrected to 'plants_in_beds'
        const query = 'DELETE FROM plants_in_beds WHERE bed_id = $1 RETURNING id;';
        const { rowCount } = await pool.query(query, [bedId]);
        return rowCount;
    } catch (error) {
        console.error('Database error in plantModel.removeByBedId:', error);
        throw error;
    }
}


module.exports = {
    savePlantsInBed,
    getPlantsForBed,
    getAllPlants,
    getPlantById,
    removeByBedId
};

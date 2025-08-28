/**
 * @file models/plantModel.js
 * @description Handles database interactions for the plants_in_beds resource.
 */

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

        // Step 2: Validate plant data
        const requiredFields = ['id', 'plant_id', 'x_position', 'y_position', 'plant_role', 'name', 'spacing', 'icon'];
        for (const plant of plantsArray) {
            for (const field of requiredFields) {
                if (plant[field] === undefined || plant[field] === null) {
                    throw new Error(`Validation error: Missing required field '${field}' in plant: ${JSON.stringify(plant)}`);
                }
            }
        }

        // Step 3: Delete all existing plants for the bed
        const deleteQuery = 'DELETE FROM plants_in_beds WHERE bed_id = $1;';
        await client.query(deleteQuery, [bedId]);

        // Step 4: Insert all new plants from the array
        const insertQuery = `
            INSERT INTO plants_in_beds (id, bed_id, plant_id, planted_date, x_position, y_position, plant_role, icon, spacing, name)
            VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9);
        `;
        for (const plant of plantsArray) {
            await client.query(insertQuery, [
                plant.id,
                bedId,
                plant.plant_id,
                plant.x_position,
                plant.y_position,
                plant.plant_role,
                plant.icon,
                plant.spacing,
                plant.name
            ]);
        }

        await client.query('COMMIT');
        console.log(`Successfully saved ${plantsArray.length} plants to bed ${bedId}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error in plantModel.savePlantsInBed:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Gets all plants for a specific bed from the plants_in_beds table.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed.
 * @returns {Promise<Array<Object>>} An array of plant objects.
 */
async function getPlantsForBed(userId, gardenId, bedId) {
    try {
        // Validate the bed exists and belongs to the user
        const bedCheckQuery = `
            SELECT gb.id FROM garden_beds gb
            JOIN gardens g ON gb.garden_id = g.id
            WHERE g.user_id = $1 AND g.id = $2 AND gb.id = $3;
        `;
        const { rows: bedRows } = await pool.query(bedCheckQuery, [userId, gardenId, bedId]);
        if (bedRows.length === 0) {
            throw new Error('Validation error: Bed does not exist or does not belong to the user/garden.');
        }

        // Select columns from plants_in_beds
        const plantQuery = `
            SELECT
                id,
                bed_id,
                plant_id,
                planted_date,
                x_position,
                y_position,
                plant_role,
                icon,
                spacing,
                name
            FROM plants_in_beds
            WHERE bed_id = $1;
        `;
        const { rows } = await pool.query(plantQuery, [bedId]);
        console.log(`Retrieved ${rows.length} plants for bed ${bedId}`);
        return rows;
    } catch (error) {
        console.error('Database error in plantModel.getPlantsForBed:', error);
        throw error;
    }
}

/**
 * Deletes all plant-to-bed associations for a given bed ID.
 * @param {string} bedId - The ID of the bed.
 * @returns {Promise<number>} The number of deleted associations.
 */
async function removeByBedId(bedId) {
    try {
        const query = 'DELETE FROM plants_in_beds WHERE bed_id = $1 RETURNING id;';
        const { rowCount } = await pool.query(query, [bedId]);
        console.log(`Deleted ${rowCount} plant associations for bed ${bedId}`);
        return rowCount;
    } catch (error) {
        console.error('Database error in plantModel.removeByBedId:', error);
        throw error;
    }
}

module.exports = {
    savePlantsInBed,
    getPlantsForBed,
    removeByBedId
};
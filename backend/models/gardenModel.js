/**
 * @file models/gardenModel.js
 * @description Handles all database interactions for the garden resource.
 */

const { pool } = require('../db');

/**
 * Creates a new garden and sets all other gardens for that user to inactive in a single transaction.
 * @param {string} userId - The ID of the user who owns the garden.
 * @param {Object} gardenData - An object containing the garden's data.
 * @returns {Promise<Object>} The newly created garden object.
 */
async function createAndActivate(userId, gardenData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // all of the user's existing gardens to inactive.
        const deactivateQuery = `
            UPDATE gardens
            SET is_active = FALSE
            WHERE user_id = $1;
        `;
        await client.query(deactivateQuery, [userId]);

        // new garden and set it to active.
        const createQuery = `
            INSERT INTO gardens (user_id, garden_name, width, height, is_active)
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING id, garden_name, width, height, is_active;
        `;
        const { rows } = await client.query(createQuery, [
            userId,
            gardenData.garden_name,
            gardenData.width,
            gardenData.height,
        ]);
        const newGarden = rows[0];

        await client.query('COMMIT');
        return newGarden;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error in gardenModel.createAndActivate:', error);
        throw error;
    } finally {
        client.release();
    }
}

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

/**
 * Find a single garden by its ID.
 * @param {string} gardenId - The ID of the garden to retrieve.
 * @returns {Promise<Object|null>} The garden object, or null if not found.
 */
async function findById(gardenId) {
    try {
        const query = 'SELECT id, user_id, garden_name, width, height, is_active FROM gardens WHERE id = $1;';
        const { rows } = await pool.query(query, [gardenId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in gardenModel.findById:', error);
        throw error;
    }
}
/**
 * Updates a garden's information in the database. If is_active is set to true, all other gardens for the user are set to false.
 * @param {string} gardenId - The ID of the garden to update.
 * @param {Object} newData - An object containing the new data.
 * @returns {Promise<Object|null>} The updated garden object, or null if not found.
 */
async function update(gardenId, newData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 

        let updatedGarden;

        // Check if the user is attempting to set the garden to active
        if (newData.is_active === true) {
            // user_id of the garden being updated
            const getUserIdQuery = 'SELECT user_id FROM gardens WHERE id = $1;';
            const { rows: userRows } = await client.query(getUserIdQuery, [gardenId]);
            const userId = userRows[0]?.user_id;

            if (userId) {
                // Set all other gardens for that user to inactive
                const deactivateQuery = `
                    UPDATE gardens
                    SET is_active = FALSE
                    WHERE user_id = $1 AND id != $2;
                `;
                await client.query(deactivateQuery, [userId, gardenId]);
            }
        }
        
        // update on the target garden
        const updateQuery = `
            UPDATE gardens
            SET garden_name = COALESCE($1, garden_name),
                width = COALESCE($2, width),
                height = COALESCE($3, height),
                is_active = COALESCE($4, is_active)
            WHERE id = $5
            RETURNING id, garden_name, width, height, is_active;
        `;
        const { rows } = await client.query(updateQuery, [
            newData.garden_name,
            newData.width,
            newData.height,
            newData.is_active,
            gardenId
        ]);
        
        updatedGarden = rows[0] || null;

        await client.query('COMMIT');
        return updatedGarden;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error in gardenModel.update:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Deletes a garden from the database and sets the most recent previous garden to active.
 * @param {string} gardenId - The ID of the garden to delete.
 * @returns {Promise<Object|null>} The deleted garden's ID, or null.
 */
async function remove(gardenId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 

        // user_id of the garden being deleted.
        const getUserIdQuery = 'SELECT user_id FROM gardens WHERE id = $1;';
        const { rows: userRows } = await client.query(getUserIdQuery, [gardenId]);
        const userId = userRows[0]?.user_id;

        if (!userId) {
            await client.query('ROLLBACK');
            return null; 
        }

        // delete the specified garden.
        const deleteQuery = 'DELETE FROM gardens WHERE id = $1 RETURNING id;';
        const { rows: deletedRows } = await client.query(deleteQuery, [gardenId]);

        if (deletedRows.length === 0) {
            await client.query('ROLLBACK');
            return null; 
        }
        
        // Find the most recent garden for that user that is NOT the deleted one.
        const findNewActiveQuery = `
            SELECT id FROM gardens
            WHERE user_id = $1 AND id != $2
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        const { rows: newActiveGardenRows } = await client.query(findNewActiveQuery, [userId, gardenId]);

        // If a previous garden is found, set it to active.
        if (newActiveGardenRows.length > 0) {
            const newActiveGardenId = newActiveGardenRows[0].id;
            const activateQuery = 'UPDATE gardens SET is_active = TRUE WHERE id = $1;';
            await client.query(activateQuery, [newActiveGardenId]);
        }

        await client.query('COMMIT'); 
        return deletedRows[0];
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Database error in gardenModel.remove:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    createAndActivate, findGardensByUserId, findById, update, remove
};
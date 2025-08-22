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
async function findGardenByUserAndGardenId(userId, gardenId) {
    try {
        const query = `
            SELECT id, garden_name, width, height, is_active
            FROM gardens
            WHERE user_id = $1 AND id = $2;
        `;
        const { rows } = await pool.query(query, [userId, gardenId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in findGardenByUserAndGardenId:', error);
        throw error;
    }
}
/**
 * Updates a garden's information in the database. If is_active is set to true, all other gardens for the user are set to false.
 * @param {string} gardenId - The ID of the garden to update.
 * @param {Object} newData - An object containing the new data.
 * @returns {Promise<Object|null>} The updated garden object, or null if not found.
 */
async function updateByUserAndId(userId, gardenId, newData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let updatedGarden;

        // If setting this garden as active, deactivate all others for this user
        if (newData.is_active === true) {
            const deactivateQuery = `
                UPDATE gardens
                SET is_active = FALSE
                WHERE user_id = $1 AND id != $2;
            `;
            await client.query(deactivateQuery, [userId, gardenId]);
        }

        // Force undefined values to null so COALESCE will work
        const {
            garden_name = null,
            width = null,
            height = null,
            is_active = null
        } = newData;

        const updateQuery = `
            UPDATE gardens
            SET garden_name = COALESCE($1, garden_name),
                width = COALESCE($2, width),
                height = COALESCE($3, height),
                is_active = COALESCE($4, is_active),
                updated_at = now()
            WHERE id = $5 AND user_id = $6
            RETURNING id, garden_name, width, height, is_active;
        `;
        
        const { rows } = await client.query(updateQuery, [
            garden_name,
            width,
            height,
            is_active,
            gardenId,
            userId
        ]);

        updatedGarden = rows[0] || null;

        await client.query('COMMIT');
        return updatedGarden;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error in updateByUserAndId:', error);
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
async function removeByUserAndId(userId, gardenId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Confirm ownership
        const verifyQuery = 'SELECT id FROM gardens WHERE id = $1 AND user_id = $2;';
        const { rows: verifyRows } = await client.query(verifyQuery, [gardenId, userId]);

        if (verifyRows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Delete garden
        const deleteQuery = 'DELETE FROM gardens WHERE id = $1 RETURNING id;';
        const { rows: deletedRows } = await client.query(deleteQuery, [gardenId]);

        // Activate another garden if possible
        const findNewActiveQuery = `
            SELECT id FROM gardens
            WHERE user_id = $1 AND id != $2
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        const { rows: newActiveRows } = await client.query(findNewActiveQuery, [userId, gardenId]);

        if (newActiveRows.length > 0) {
            const newActiveId = newActiveRows[0].id;
            await client.query('UPDATE gardens SET is_active = TRUE WHERE id = $1;', [newActiveId]);
        }

        await client.query('COMMIT');
        return deletedRows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error in removeByUserAndId:', error);
        throw error;
    } finally {
        client.release();
    }
}
/**
 * Deletes all gardens associated with a given user ID.
 * @param {number} userId - The ID of the user whose gardens should be deleted.
 * @returns {Promise<number>} The number of deleted gardens.
 */
async function removeByUserId(userId) {
    try {
        const query = 'DELETE FROM gardens WHERE user_id = $1 RETURNING id;';
        const { rowCount } = await pool.query(query, [userId]);
        return rowCount;
    } catch (error) {
        console.error('Database error in gardenModel.removeByUserId:', error);
        throw error;
    }
}

module.exports = {
    createAndActivate, 
    findGardensByUserId, 
    findGardenByUserAndGardenId, 
    updateByUserAndId, 
    removeByUserAndId,
    removeByUserId
};
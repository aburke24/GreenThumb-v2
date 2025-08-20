/**
 * @file models/bedModel.js
 * @description Handles all database interactions for the bed resource.
 */

const { pool } = require('../db');

/**
 * Creates a new bed in a specific garden.
 * @param {Object} bedData - An object containing the bed's data (garden_id, name, top_position, left_position, width, height).
 * @returns {Promise<Object>} The newly created bed object.
 */
async function create(bedData) {
    try {
        const createQuery = `
            INSERT INTO garden_beds (garden_id, name, top_position, left_position, width, height)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, garden_id, name, top_position, left_position, width, height;
        `;
        const { rows } = await pool.query(createQuery, [
            bedData.garden_id,
            bedData.name,
            bedData.top_position,
            bedData.left_position,
            bedData.width,
            bedData.height
        ]);
        return rows[0];
    } catch (error) {
        console.error('Database error in bedModel.create:', error);
        throw error;
    }
}

/**
 * Finds all beds for a specific garden.
 * This function is used to prepare for a cascading delete of beds and plants.
 * @param {string} gardenId - The ID of the garden.
 * @returns {Promise<Array<Object>>} An array of bed documents.
 */
async function findBedsByGardenId(gardenId) {
    try {
        const query = 'SELECT * FROM garden_beds WHERE garden_id = $1;';
        const { rows } = await pool.query(query, [gardenId]);
        return rows;
    } catch (error) {
        console.error('Database error in bedModel.findBedsByGardenId:', error);
        throw error;
    }
}

/**
 * Gets all garden beds and their associated plants for a specific garden.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @returns {Promise<Array<Object>>} An array of garden bed objects, each with an array of plants.
 */
async function findGardenBedsAndPlantsByGardenId(userId, gardenId) {
    try {
        const query = `
            SELECT
                gb.id AS bed_id,
                gb.name AS bed_name,
                gb.width,
                gb.height,
                gb.top_position,
                gb.left_position,
                JSON_AGG(
                    JSONB_BUILD_OBJECT(
                        'plant_in_bed_id', pb.id,
                        'plant_id', p.id,
                        'common_name', p.common_name,
                        'icon_image', p.icon_image,
                        'x_position', pb.x_position,
                        'y_position', pb.y_position,
                        'plant_role', pb.plant_role
                    )
                ) AS plants
            FROM garden_beds gb
            JOIN gardens g ON gb.garden_id = g.id
            LEFT JOIN plants_in_beds pb ON gb.id = pb.bed_id
            LEFT JOIN plants p ON pb.plant_id = p.id
            WHERE g.user_id = $1 AND g.id = $2
            GROUP BY gb.id, gb.name, gb.width, gb.height, gb.top_position, gb.left_position;
        `;
        const { rows } = await pool.query(query, [userId, gardenId]);
        return rows;
    } catch (error) {
        console.error('Database error in bedModel.findGardenBedsAndPlantsByGardenId:', error);
        throw error;
    }
}

/**
 * Retrieves a single bed by its user, garden, and bed ID.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed.
 * @returns {Promise<Object|null>} The bed object or null if not found.
 */
async function findBedByUserIdGardenIdAndBedId(userId, gardenId, bedId) {
    try {
        const query = `
            SELECT gb.* FROM garden_beds gb
            JOIN gardens g ON gb.garden_id = g.id
            WHERE g.user_id = $1 AND g.id = $2 AND gb.id = $3;
        `;
        const { rows } = await pool.query(query, [userId, gardenId, bedId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in bedModel.findBedByUserIdGardenIdAndBedId:', error);
        throw error;
    }
}

/**
 * Updates a bed's information in the database.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed to update.
 * @param {Object} newData - An object containing the new data.
 * @returns {Promise<Object|null>} The updated bed object, or null if not found.
 */
async function update(userId, gardenId, bedId, newData) {
    try {
        const updateQuery = `
            UPDATE garden_beds
            SET name = COALESCE($1, name),
                top_position = COALESCE($2, top_position),
                left_position = COALESCE($3, left_position),
                width = COALESCE($4, width),
                height = COALESCE($5, height)
            WHERE id = $6
            AND garden_id = $7
            AND EXISTS (SELECT 1 FROM gardens WHERE id = $7 AND user_id = $8)
            RETURNING id, garden_id, name, top_position, left_position, width, height;
        `;
        const { rows } = await pool.query(updateQuery, [
            newData.name,
            newData.top_position,
            newData.left_position,
            newData.width,
            newData.height,
            bedId,
            gardenId,
            userId
        ]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in bedModel.update:', error);
        throw error;
    }
}

/**
 * Deletes a bed from the database.
 * @param {string} userId - The ID of the user.
 * @param {string} gardenId - The ID of the garden.
 * @param {string} bedId - The ID of the bed to delete.
 * @returns {Promise<Object|null>} The deleted bed's ID, or null.
 */
async function remove(userId, gardenId, bedId) {
    try {
        const deleteQuery = `
            DELETE FROM garden_beds
            WHERE id = $3 AND garden_id = $2
            AND id IN (
                SELECT gb.id
                FROM garden_beds gb
                JOIN gardens g ON gb.garden_id = g.id
                WHERE g.user_id = $1
            )
            RETURNING id;
        `;
        const { rows } = await pool.query(deleteQuery, [userId, gardenId, bedId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in bedModel.remove:', error);
        throw error;
    }
}

/**
 * Deletes all beds associated with a given garden ID.
 * @param {number} gardenId - The ID of the garden whose beds should be deleted.
 * @returns {Promise<number>} The number of deleted beds.
 */
async function removeByGardenId(gardenId) {
    try {
        const query = 'DELETE FROM garden_beds WHERE garden_id = $1 RETURNING id;';
        const { rowCount } = await pool.query(query, [gardenId]);
        return rowCount;
    } catch (error) {
        console.error('Database error in bedModel.removeByGardenId:', error);
        throw error;
    }
}

module.exports = {
    create,
    findBedsByGardenId,
    findGardenBedsAndPlantsByGardenId,
    findBedByUserIdGardenIdAndBedId,
    update,
    remove,
    removeByGardenId
};

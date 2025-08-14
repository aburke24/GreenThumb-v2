/**
 * @file models/userModel.js
 * @description Handles all database interactions for user data.
 */

//Imports
const { pool } = require('../db');

/**
 * Creates a new user in the database.
 * @param {Object} userData - The user's data, including username, email, and a hashed password.
 * @returns {Promise<Object>} The newly created user object.
 */
async function create(userData){
    try{
    const createQuery = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email;
        `;

        const { rows } = await pool.query(createQuery, [userData.username, userData.email, userData.password_hash]);
        return rows[0];
    }catch(error){
        console.error('Database error in userModel.create:', error);
        throw error;
    }
}

/**
 * Retrieves a user's ID by email.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} The user object with ID, or null if not found.
 */
async function getUserId(email){
   try{
        const getUserIdQuery = `
            SELECT id FROM users WHERE email = $1;
            `;
        const { rows } = await pool.query(getUserIdQuery, [email]);
        return rows[0] || null;
   }catch(error){
        console.error('Database error in userModel.getUserId:', error);
        throw error;
   }
}

/**
 * Retrieves a user's basic profile information.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object|null>} The user object or null if not found.
 */
async function findUserById(userId) {
    try {
        const query = 'SELECT id, username, email, city, state FROM users WHERE id = $1;';
        const { rows } = await pool.query(query, [userId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in userModel.findUserById:', error);
        throw error;
    }
}

/**
 * Updates a user's information in the database.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} newData - An object containing the new data for the user.
 * @returns {Promise<Object|null>} The updated user object, or null if the user was not found.
 */
async function update(userId, newData) {
    try {
        const updateQuery = `
        UPDATE users
        SET username = COALESCE($1, username), 
            email = COALESCE($2, email), 
            password_hash = COALESCE($3, password_hash),
            city = COALESCE($4, city),
            state = COALESCE($5, state)
        WHERE id = $6
        RETURNING id, username, email, city, state;
        `;
        
        const { rows } = await pool.query(updateQuery, [
            newData.username, 
            newData.email, 
            newData.password_hash,
            newData.city,
            newData.state,
            userId
        ]);
        
        return rows[0] || null;
    } catch (error) {
        console.error('Database error in userModel.update', error);
        throw error;
    }
}

/**
 * Deletes a user from the database by email.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} The deleted user's ID, or null.
 */
async function remove(email) {
  try {
    const removeQuery = 'DELETE FROM users WHERE email = $1 RETURNING id;';
    const { rows } = await pool.query(removeQuery, [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in userModel.remove:', error);
    throw error;
  }
}

module.exports = {
    create, getUserId, findUserById, update, remove
};


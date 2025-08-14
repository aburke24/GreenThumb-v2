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
 * Finds a user by their email for the login process.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} The user object with the password hash if found, or null.
 */
async function findByEmail(email){
    try{
        const findByEmailQuery = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await pool.query(findByEmailQuery, [email]);
        return rows[0] || null;
    
    }catch(error){
         console.error('Database error in userModel.findByEmail:', error);
        throw error;
    }
}

/**
 * Finds a user and all their associated data (gardens, beds, plants).
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object|null>} A processed, nested user object or null if not found.
 */
async function findUserAndAllData(userId) {
    try{
        // _________ todo: make sure this query has all needed data ____________
        const findUserQuer =`
      SELECT
        u.id AS user_id, u.username, u.email,
        g.id AS garden_id, g.garden_name,
        gb.id AS bed_id, gb.name AS bed_name, gb.width AS bed_width
        // ... more columns for plants ...
      FROM users u
      LEFT JOIN gardens g ON u.id = g.user_id
      LEFT JOIN garden_beds gb ON g.id = gb.garden_id
      WHERE u.id = $1;
    `;

    const { rows } = await pool.query(findUserQuery, [userId]);

    if (rows.length ==0){
        return null;
    }

    // todo _________ update into proper object ___________
    const userData = {};
    return userData;
    }catch (error) {
        console.error('Database error in userModel.findUserAndAllData:', error);
        throw error;
  }
}

/**
 * Updates a user's information in the database.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} newData - An object containing the new data for the user.
 * @returns {Promise<Object|null>} The updated user object, or null if the user was not found.
 */
async function update(userId, newData){
    try{
        //________ todo: This needs to have all the user's data!!!!_________
        const updateQuery = `
        UPDATE users
        SET username = COALESCE($1, username), email = COALESCE($2, email)
        WHERE id = $3
        RETURNING *;
        `;

        // __________todo: this needs to have all the user data_________
        const { rows } = await pool.query(updateQuery, [[newData.username, newData.email, userId]])
        return rows[0] || null;
    }catch(error){
        console.error('Database error in userModel.update', error);
    }
}

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
    create, findByEmail, findUserAndAllData, update, remove
};


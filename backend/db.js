/**
 * @file db.js
 * @description Establishes and exports the PostgreSQL database connection pool.
 *
 * This file is a central point for all database interactions to avoid
 * circular dependencies and ensure a single connection instance is used.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables.
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool so other files can import and use it.
module.exports = {
  pool,
};

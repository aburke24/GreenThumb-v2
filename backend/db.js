/**
 * @file db.js
 * @description Establishes and exports the PostgreSQL database connection pool.
 *
 * This file is a central point for all database interactions to avoid
 * circular dependencies and ensure a single connection instance is used.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

module.exports = {
  pool,
};

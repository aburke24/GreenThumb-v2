/**
 * @file db.js
 * @description Establishes and exports the PostgreSQL database connection pool.
 *
 * This file is a central point for all database interactions.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables.
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // This is necessary to prevent connection errors on services like Railway,
    // which use SSL connections.
    rejectUnauthorized: false,
  },
});

// Add an event listener to the pool for error logging
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool so other files can import and use it.
module.exports = {
  pool,
};

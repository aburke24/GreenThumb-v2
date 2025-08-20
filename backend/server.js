/**
 * @file server.js
 * @description Main application file to set up the Express server.
 *
 * This file is the entry point of the backend. It handles server initialization,
 * database connection, and middleware.
 */

// Imports
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 

// Load environment variables as early as possible
dotenv.config();

// database pool 
const { pool } = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bedRoutes = require('./routes/bed');
const gardenRoutes = require('./routes/garden');
const plantRoutes = require('./routes/plant'); 

// Create Express app only once
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

const PORT = process.env.PORT || 3001;

// parse JSON request bodies
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/gardens', gardenRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/plants', plantRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

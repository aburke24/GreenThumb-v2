/**
 * @file routes/auth.js
 * @description API routes for user authentication.
 *
 * This file handles login and registration requests.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// login
router.post('/login', authController.login);

// register
router.post('/register', authController.register);

module.exports = router;
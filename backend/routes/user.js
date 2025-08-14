/**
 * @file routes/user.js
 * @description Defines the API endpoints for the user resource.
 *
 * This file maps incoming HTTP requests (like GET and PUT) to specific
 * functions in the user controller that will handle the business logic.
 */

// Imports
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET userId
router.get('/user/email', (req,res) =>{
    userController.getUserId(req,res);
})

// GET Route
router.get('/user/:userId', (req,res) => {
    userController.getUserData(req,res);
})

// PUT Route
router.put('/user/:userId',(req,res) =>{
    userController.updateUser(req,res);
})

// DELETE Route
router.delete('/users/:userEmail', userController.deleteUser);

module.exports = router;
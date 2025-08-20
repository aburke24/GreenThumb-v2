/**
 * @file routes/bed.js
 * @description API routes for managing garden beds using query parameters.
 */

//Imports
const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');

// Route to create a new bed
router.post('/', bedController.createBed);

// Route to get a specific bed or all beds in a garden using query parameters
router.get('/', bedController.getBedsInGarden);

// Route to update a specific bed using query parameters
router.put('/', bedController.updateBed);

// Route to delete a specific bed using query parameters
router.delete('/', bedController.deleteBed);

module.exports = router;

/**
 * @file routes/garden.js
 * @description API routes for managing garden resources.
 */

//Imports
const express = require('express');
const router = express.Router();
const gardenController = require('../controllers/gardenController');

// create garden
router.post('/', gardenController.createGarden);

// get garden
router.get('/', gardenController.getGardenByUserAndId);

// update garden
router.put('/', gardenController.updateGardenByUserAndId);

// delete garden
router.delete('/', gardenController.deleteGardenByUserAndId);

module.exports = router;
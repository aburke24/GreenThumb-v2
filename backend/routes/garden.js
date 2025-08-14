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
router.get('/:gardenId', gardenController.getGardenById);

// update garden
router.put('/:gardenId', gardenController.updateGarden);

// delete garden
router.delete('/:gardenId', gardenController.deleteGarden);

module.exports = router;
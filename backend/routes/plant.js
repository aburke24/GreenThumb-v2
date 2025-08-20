/**
 * @file routes/plants.js
 * @description Defines the API endpoints for managing plants.
 * This version only includes the endpoints for saving plants to a bed and fetching plant data.
 */

const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');

// Route to save an entire array of plants to a bed in a single transaction
router.post('/save-plants', plantController.savePlants);

// Fetch all plants for a specific bed
router.get('/all-plants', plantController.getPlantsInBed);

// Fetch all plants from the catalog
router.get('/catalog', plantController.getAllPlantsFromCatalog);

// Fetch a single plant from the catalog by its ID
router.get('/catalog/:plantId', plantController.getPlantFromCatalog);

module.exports = router;

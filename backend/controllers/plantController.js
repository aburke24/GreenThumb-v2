 /**
 * @file controllers/plantController.js
 * @description Defines the controller functions for managing plants within beds and from the catalog.
 * This version is simplified to match the updated routes.
 */

const plantModel = require('../models/plantModel');

/**
 * Controller to save a full array of plants.
 * This function will replace the existing plants in a bed with the new array.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function savePlants(req, res) {
    const { userId, gardenId, bedId } = req.query;
    const plantsArray = req.body;

    if (!userId || !gardenId || !bedId) {
        return res.status(400).json({ message: 'ERROR: userId, gardenId, and bedId are all required query parameters.' });
    }

    if (!Array.isArray(plantsArray)) {
        return res.status(400).json({ message: 'ERROR: The request body must be an array of plants.' });
    }

    try {
        await plantModel.savePlantsInBed(userId, gardenId, bedId, plantsArray);
        res.status(200).json({ message: `Successfully saved all plants to bed ${bedId}.` });
    } catch (error) {
        console.error('Error saving plants:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to get all plants for a specific bed.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getPlantsInBed(req, res) {
    const { userId, gardenId, bedId } = req.query;

    if (!userId || !gardenId || !bedId) {
        return res.status(400).json({ message: 'ERROR: userId, gardenId, and bedId are all required.' });
    }

    try {
        const plants = await plantModel.getPlantsForBed(userId, gardenId, bedId);
        res.status(200).json(plants);
    } catch (error) {
        console.error('Error fetching plants for bed:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to get all plants from the catalog.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getAllPlantsFromCatalog(req, res) {
    try {
        const plants = await plantModel.getAllPlants();
        res.status(200).json(plants);
    } catch (error) {
        console.error('Error fetching all plants from catalog:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to get a single plant from the catalog by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getPlantFromCatalog(req, res) {
    const { plantId } = req.params;

    if (!plantId) {
        return res.status(400).json({ message: 'ERROR: plantId is required.' });
    }

    try {
        const plant = await plantModel.getPlantById(plantId);
        if (plant) {
            res.status(200).json(plant);
        } else {
            res.status(404).json({ message: 'ERROR: Plant not found in catalog.' });
        }
    } catch (error) {
        console.error('Error fetching plant from catalog:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

module.exports = {
    savePlants,
    getPlantsInBed,
    getAllPlantsFromCatalog,
    getPlantFromCatalog
};

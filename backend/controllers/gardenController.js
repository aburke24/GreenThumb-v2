/**
 * @file controllers/gardenController.js
 * @description Defines the controller functions for creating and deleting gardens.
 */

// Imports
const gardenModel = require('../models/gardenModel');
const bedModel = require('../models/bedModel');
const plantModel = require('../models/plantModel');

/**
 * Controller function to create a new garden for a user.
 * This also ensures the new garden is set to active and all previous gardens are set to inactive.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function createGarden(req,res){
    const { userId, ...gardenData } = req.body;
     
    if (!userId) {
        return res.status(400).json({ message: 'ERROR: User ID is required to create a garden.' });
    }

    try {
        const newGarden = await gardenModel.createAndActivate(userId, gardenData);
        res.status(201).json(newGarden);
    } catch (error) {
        console.error('Error creating new garden:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to get a single garden by its ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getGardenByUserAndId(req, res) {
    const { userId, gardenId } = req.query;

    if (!userId || !gardenId) {
        return res.status(400).json({ message: 'ERROR: Both userId and gardenId are required.' });
    }

    try {
        const garden = await gardenModel.findGardenByUserAndGardenId(userId, gardenId);
        if (garden) {
            res.status(200).json(garden);
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found for this user.' });
        }
    } catch (error) {
        console.error('Error fetching garden by user and garden ID:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to update a garden's information.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function updateGardenByUserAndId(req, res) {
    const { userId, gardenId } = req.query;
    const newData = req.body;

    if (!userId || !gardenId) {
        return res.status(400).json({ message: 'ERROR: userId and gardenId are required query parameters.' });
    }

    try {
        const updatedGarden = await gardenModel.updateByUserAndId(userId, gardenId, newData);
        if (updatedGarden) {
            res.status(200).json(updatedGarden);
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found or not owned by user.' });
        }
    } catch (error) {
        console.error('Error updating garden by user and ID:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}



/**
 * Controller function to delete a garden.
 * This now includes a cascading delete for all beds and plants associated with the garden.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function deleteGardenByUserAndId(req, res) {
    const { userId, gardenId } = req.query;

    if (!userId || !gardenId) {
        return res.status(400).json({ message: 'ERROR: userId and gardenId are required query parameters.' });
    }

    try {
        // Step 1: Find all beds for the specified garden.
        const beds = await bedModel.findBedsByGardenId(gardenId);

        // Step 2: Iterate through each bed and delete its plants.
        for (const bed of beds) {
            await plantModel.removeByBedId(bed.id);
        }

        // Step 3: Delete all beds for the garden.
        await bedModel.removeByGardenId(gardenId);

        // Step 4: Delete the garden itself.
        const deletedGarden = await gardenModel.removeByUserAndId(userId, gardenId);

        if (deletedGarden) {
            res.status(200).json({ message: 'Garden and all associated beds and plants deleted successfully', id: deletedGarden.id });
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found or not owned by user.' });
        }
    } catch (error) {
        console.error('Error deleting garden, beds, and plants:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}
module.exports = {
    createGarden,
    getGardenByUserAndId,
   updateGardenByUserAndId,
   deleteGardenByUserAndId
}
/**
 * @file controllers/gardenController.js
 * @description Defines the controller functions for creating and deleting gardens.
 */

// Imports
const gardenModel = require('../models/gardenModel');

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
async function getGardenById(req, res) {
    const { gardenId } = req.params;
    try {
        const garden = await gardenModel.findById(gardenId);
        if (garden) {
            res.status(200).json(garden);
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found' });
        }
    } catch (error) {
        console.error('Error getting garden by ID:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to update a garden's information.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function updateGarden(req, res) {
    const { gardenId } = req.params;
    const newData = req.body;
    try {
        const updatedGarden = await gardenModel.update(gardenId, newData);
        if (updatedGarden) {
            res.status(200).json(updatedGarden);
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found' });
        }
    } catch (error) {
        console.error('Error updating garden data:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}



/**
 * Controller function to delete a garden.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function deleteGarden(req,res){
    const { gardenId } = req.params;
    try {
        const deletedGarden = await gardenModel.remove(gardenId);
        if (deletedGarden) {
            res.status(200).json({ message: 'Garden deleted successfully', id: deletedGarden.id });
        } else {
            res.status(404).json({ message: 'ERROR: Garden not found' });
        }
    } catch (error) {
        console.error('Error deleting garden:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
};

module.exports = {
    createGarden,
    getGardenById,
    updateGarden,
    deleteGarden
}
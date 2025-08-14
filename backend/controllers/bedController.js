/**
 * @file controllers/bedController.js
 * @description Defines the controller functions for creating, updating, and deleting garden beds.
 */

const bedModel = require('../models/bedModel');
const gardenModel = require('../models/gardenModel');

/**
 * Controller function to create a new bed for a garden.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function createBed(req, res) {
    const { garden_id, ...bedData } = req.body;

    if (!garden_id) {
        return res.status(400).json({ message: 'ERROR: Garden ID is required to create a bed.' });
    }

    try {
        const newBed = await bedModel.create(req.body);
        res.status(201).json(newBed);
    } catch (error) {
        console.error('Error creating new bed:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to get a specific bed by its user, garden, and bed ID using query parameters.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getBedByGardenIdAndBedId(req, res) {
    const { userId, gardenId, bedId } = req.query;

    if (!userId || !gardenId || !bedId) {
        return res.status(400).json({ message: 'ERROR: userId, gardenId, and bedId are all required.' });
    }

    try {
        const bed = await bedModel.findBedByUserIdGardenIdAndBedId(userId, gardenId, bedId);

        if (!bed) {
            return res.status(404).json({ message: 'ERROR: Bed not found for the specified user and garden.' });
        }

        res.status(200).json(bed);
    } catch (error) {
        console.error('Error fetching bed:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to update a bed by its user, garden, and bed ID using query parameters.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function updateBed(req, res) {
    const { userId, gardenId, bedId } = req.query;
    const newData = req.body;

    if (!userId || !gardenId || !bedId) {
        return res.status(400).json({ message: 'ERROR: userId, gardenId, and bedId are all required.' });
    }

    try {
        const updatedBed = await bedModel.update(userId, gardenId, bedId, newData);
        if (updatedBed) {
            res.status(200).json(updatedBed);
        } else {
            res.status(404).json({ message: 'ERROR: Bed not found for the specified user and garden.' });
        }
    } catch (error) {
        console.error('Error updating bed:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Controller function to delete a bed by its user, garden, and bed ID using query parameters.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function deleteBed(req, res) {
    const { userId, gardenId, bedId } = req.query;

    if (!userId || !gardenId || !bedId) {
        return res.status(400).json({ message: 'ERROR: userId, gardenId, and bedId are all required.' });
    }

    try {
        const deletedBed = await bedModel.remove(userId, gardenId, bedId);
        if (deletedBed) {
            res.status(200).json({ message: 'Bed deleted successfully', id: deletedBed.id });
        } else {
            res.status(404).json({ message: 'ERROR: Bed not found for the specified user and garden.' });
        }
    } catch (error) {
        console.error('Error deleting bed:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

module.exports = {
    createBed,
    getBedByGardenIdAndBedId,
    updateBed,
    deleteBed
};

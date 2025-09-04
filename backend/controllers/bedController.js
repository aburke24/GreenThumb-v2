/**
 * @file controllers/bedController.js
 * @description Defines the controller functions for creating, updating, and deleting garden beds.
 */

const bedModel = require('../models/bedModel');
const gardenModel = require('../models/gardenModel');
const plantModel = require('../models/plantModel');

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
 * Controller function to get a specific bed OR all beds by its user and garden ID using query parameters.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getBedsInGarden(req, res) {
    const { userId, gardenId, bedId } = req.query;

    if (!userId || !gardenId) {
        return res.status(400).json({ message: 'ERROR: userId and gardenId are required.' });
    }

    try {
        let beds;

        // If a bedId is provided, get only that specific bed.
        if (bedId) {
            beds = await bedModel.findBedByUserIdGardenIdAndBedId(userId, gardenId, bedId);
            if (beds) {
                return res.status(200).json(beds);
            } else {
                return res.status(404).json({ message: 'ERROR: Bed not found for the specified user and garden.' });
            }
        } else {
            // If no bedId is provided, get all beds in the garden.
            beds = await bedModel.findGardenBedsAndPlantsByGardenId(userId, gardenId);

            // ✅ Return an empty array instead of an error when no beds found
            if (!beds || beds.length === 0) {
                return res.status(200).json([]);  // <-- Changed this line
            }

            return res.status(200).json(beds);
        }
    } catch (error) {
        console.error('Error fetching bed(s):', error);
        return res.status(500).json({ message: 'ERROR: Internal server error' });
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
        // Step 1: Delete all plants associated with the bed.
        await plantModel.removeByBedId(bedId);

        // Step 2: Delete the bed itself.
        const deletedBed = await bedModel.remove(userId, gardenId, bedId);

        if (deletedBed) {
            res.status(200).json({ message: 'Bed and all associated plants deleted successfully', id: deletedBed.id });
        } else {
            res.status(404).json({ message: 'ERROR: Bed not found for the specified user and garden.' });
        }
    } catch (error) {
        console.error('Error deleting bed and plants:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}


module.exports = {
    createBed,
    getBedsInGarden,
    getBedByGardenIdAndBedId,
    updateBed,
    deleteBed
};

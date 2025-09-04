/**
 * @file controllers/userController.js
 * @description Handles the business logic for user-related requests.
 *
 * This controller acts as the intermediary between the router and the model.
 * It extracts data from the request, calls the appropriate function in the
 * userModel to interact with the database, and sends a response back to the client.
 */
// Imports
const userModel = require('../models/userModel');
const gardenModel = require('../models/gardenModel');
const bedModel = require('../models/bedModel');
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Handles the creation of a new user.
 *
 * This function calls the user model to save the new user's data to the database
 * and sends a success response with the new user's information.
 *
 * @param {object} req - The Express request object, containing the new user's data in the body.
 * @param {object} res - The Express response object used to send back the result.
 */
async function createUser(req,res) {
    try{
        const newUser = await userModel.create(req.body);
        res.status(201).json(newUser);

    }catch(error){
        res.status(500).json({ message: 'ERROR: User creation failed'});
    }
}

async function getUserId(req,res) {
    try{
        const userId = await userModel.getUserByEmail(req.query.email);
       if(!userId){
            return res.status(404).json({ message: 'ERROR: User not found' }); 
       }
        res.status(201).json(userId);
    }catch(error){
        console.error('Error fetching user ID:', error);
        res.status(500).json({ message: 'ERROR: Internal server error'});
    }
}
/**
 * Controller function to get a user's full data by ID.
 * This is the new, refactored version.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
async function getUserData(req, res) {
    try {
        const { userId } = req.query;

        // Step 1: Get the user's basic profile from the userModel.
        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'ERROR: User not found' });
        }

        // Step 2: Get all the gardens for that user from the gardenModel.
        const gardens = await gardenModel.findGardensByUserId(userId);
        user.gardens = gardens;

        // Return the full, assembled user object
        // The beds and plants will be fetched separately by other endpoints
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

async function updateUser(req,res){
    const { userId } = req.query;
    const newData = req.body;

    try{
        const updatedUser = await userModel.update(userId,newData);

        if(updatedUser){
            console.log("User successfully updated");
            res.status(200).json(updatedUser);
        }else {
            // If no user was found with that ID, send a 404 Not Found error
            res.status(404).json({ message: 'ERROR: User not found' });
        }
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }

}

/**
 * @description Deletes a user and all associated data.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
async function deleteUser(req, res) {
    try {
        // Step 1: Find the user to ensure they exist.
        const userToDelete = await userModel.getUserByEmail(req.query.email);
        if (!userToDelete) {
            return res.status(404).json({ message: 'ERROR: User not found' });
        }
        const userId = userToDelete.id;

        // Step 2: Find all gardens for the user.
        const gardens = await gardenModel.findGardensByUserId(userId);

        // Step 3: Iterate through each garden to delete beds and plants.
        for (const garden of gardens) {
            const beds = await bedModel.findBedsByGardenId(garden.id);
            // Delete all plants for each bed in this garden.
            for (const bed of beds) {
                await plantModel.removeByBedId(bed.id);
            }
            // Delete all beds in this garden.
            await bedModel.removeByGardenId(garden.id);
        }

        // Step 4: Delete all gardens for the user.
        await gardenModel.removeByUserId(userId);

        // Step 5: Delete the user themselves.
        await userModel.remove(req.query.email);

        console.log(`User with email: ${req.query.email} and all associated data were successfully deleted.`);
        res.status(204).send(); // 204 No Content for a successful deletion.
    } catch (error) {
        console.error('Error deleting user and related data:', error);
        res.status(500).json({ message: 'ERROR: User deletion failed' });
    }
}

module.exports = {
  createUser,
  getUserId,
  getUserData,
  updateUser,
  deleteUser 
};
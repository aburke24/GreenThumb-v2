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

/**
 * Handles retrieving a user's data.
 *
 * This function fetches a user's profile and all their associated data from the database
 * based on the user ID provided in the URL parameters.
 *
 * @param {object} req - The Express request object, containing the user ID in the parameters.
 * @param {object} res - The Express response object used to send back the user data or an error.
 */
async function getUserData(req, res) {
    try{
        const userData = await userModel.findUserAndData(req.params.userId);
        if(!userData){
           return res.status(404).json({ message: 'ERROR: User not found' }); 
        }
        res.status(200).json(userData);
    }catch(error){
        res.status(500).json({ message: 'ERROR: Internal server error'});
    }
}

/**
 * Handles updating a user's information.
 *
 * This function updates a user's data in the database based on their ID
 * and the new data provided in the request body.
 *
 * @param {object} req - The Express request object, with the user ID in the parameters and new data in the body.
 * @param {object} res - The Express response object used to send back the updated user or an error.
 */
async function updateUser(req,res) {
    try{
        const updatedUser = await userModel.update(req.params.userId, req.body);
        if(!updatedUser){
            return res.status(404).json({ message: 'ERROR: User not found'});
        }
        res.status(200).json(updatedUser);
    }catch(error){
        res.status(500).json({ message:'ERROR: User Update failed'});
    }
}

async function deleteUser(req, res) {
    try {
        const deletedUser = await userModel.remove(req.params.userEmail);
        if (!deletedUser) {
            return res.status(404).json({ message: 'ERROR: User not found' });
        }
        console.log(`User with email: ${req.params.userEmail} was successfully deleted.`);
        res.status(204).send(); // 204 No Content for a successful deletion.
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'ERROR: User deletion failed' });
    }
}

module.exports = {
  createUser,
  getUserData,
  updateUser,
  deleteUser 
};
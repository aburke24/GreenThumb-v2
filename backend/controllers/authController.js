/**
 * @file controllers/authController.js
 * @description Handles the business logic for user authentication.
 *
 * This file contains the functions for user login and registration.
 */

// Imports
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Handles the user login process.
 *
 * This function authenticates a user by comparing the provided password
 * with the hashed password stored in the database. If successful, it
 * generates and returns a JSON Web Token (JWT).
 *
 * @param {object} req - The Express request object, containing the user's email and password in the body.
 * @param {object} res - The Express response object used to send back the JWT or an error.
 */
async function login(req, res) {
    const{ email, password } = req.body;

    try{
        // find user
        const user = await userModel.findByEmail(email);
        if(!user){
            return res.status(401).json({ message: 'ERROR: Invalid credentials'});
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({ message : 'ERROR: Invalid credientals'})
        }

        // create JWT
        const token = jwt.sign({ id: user.id}, JWT_SECRET, { expiresIn: '1h'});

        // token to client
        res.status(200).json({token, user: { id: user.id, email: user.email}});

    }catch(error){
        console.error('Login Error:', error);
        res.status(500).json({ message: 'ERROR: Internal server error' });
    }
}

/**
 * Handles the user registration process.
 *
 * This function creates a new user account, securely hashing the password
 * before storing it in the database. Upon success, it generates a JWT
 * for the new user and sends it back to the client.
 *
 * @param {object} req - The Express request object, containing the new user's credentials in the body.
 * @param {object} res - The Express response object used to send back the JWT and new user data.
 */
async function register(req, res){
    const { username, email, password} = req.body;

    try{
        // hash password
        const password_hash = await bcrypt.hash(password,10);

        // create user
        const newUser = await userModel.create({ username, email, password_hash });

        // create JWT
        const token =jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h'});

        // send token and new user info
        res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, username:newUser.username}});
    }catch(error){
        console.error('Registration error: ', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

module.exports = { login, register };
// File: src/routes/auth.js
// This file defines the routes for user authentication, including registration and login.
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { User } = require('../models'); // Sequelize model

// Instantiate AuthController with User model
const authController = new AuthController(User);

// Route for user registration
// router.post('/register', authController.register.bind(authController));
// Registration route (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  router.post('/register', authController.register.bind(authController));
}

// Route for user login
router.post('/login', authController.login.bind(authController));

// Route for password reset
router.post('/reset-password', authController.resetPassword.bind(authController));

module.exports = router;
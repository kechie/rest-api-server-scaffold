const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { User } = require('../models'); // Sequelize User model

// Instantiate UserController with User model
const userController = new UserController(User);

// Route to get all users
router.get('/', userController.getAllUsers.bind(userController));

// Route to get a user by ID
router.get('/:id', userController.getUserById.bind(userController));

// Route to create a new user
router.post('/', userController.createUser.bind(userController));

// Route to update a user by ID
router.put('/:id', userController.updateUser.bind(userController));

// Route to delete a user by ID
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
//file: src/index.js
// This is the main entry point for the Express application.
// It sets up the server, connects to the database, and configures middleware and routes.
// src/index.js
// Import necessary modules and configurations
const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, syncDatabase } = require('./models');
require('dotenv').config();

const app = express();

// Configure body-parser to handle JSON with charset=UTF-8
app.use(bodyParser.json({
  type: ['application/json', 'application/json; charset=UTF-8', 'application/json; charset=utf-8']
}));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Import user routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes); // Mount user routes

const PORT = process.env.API_PORT || 3023;

async function startServer() {
  try {
    await connectToDatabase();

    // Conditionally sync database only in development or test environments
    if (['development', 'test'].includes(process.env.NODE_ENV)) {
      await syncDatabase();
    } else {
      console.log('Skipping database sync in production environment');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
/* const express = require('express');
const { connectToDatabase, syncDatabase } = require('./models');
require('dotenv').config();

const app = express();
//app.use(express.json());
// Configure express.json to accept charset=UTF-8
app.use(express.json({
  type: ['application/json'],
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Import user routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes); // Mount user routes
const PORT = process.env.API_PORT || 3023;

async function startServer() {
  try {
    await connectToDatabase();

    // Conditionally sync database only in development or test environments
    if (['development', 'test'].includes(process.env.NODE_ENV)) {
      await syncDatabase();
      console.log('Database synced successfully');
    } else {
      //await syncDatabase();
      console.log('Skipping database sync in production environment');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); */
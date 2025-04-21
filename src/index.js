// file: src/index.js
// This is the main entry point for the Express application.
// It sets up the server, connects to the database, and configures middleware and routes.

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

// Middleware to add deprecation headers for older API versions
const addDeprecationHeaders = (version, isDeprecated, deprecationDate) => {
  return (req, res, next) => {
    if (isDeprecated) {
      res.set({
        'X-API-Version-Deprecated': 'true',
        'X-API-Deprecation-Date': deprecationDate || 'TBD',
        'X-API-Version': version
      });
    } else {
      res.set({ 'X-API-Version': version });
    }
    next();
  };
};

// Import routes for different API versions
const authRoutesV1 = require('./routes/v1/auth');
const userRoutesV1 = require('./routes/v1/users');
const authRoutesV2 = require('./routes/v2/auth');
const userRoutesV2 = require('./routes/v2/users');

// Mount routes with versioning and deprecation headers
app.use('/v1/auth', addDeprecationHeaders('v1', true, '2025-12-31'), authRoutesV1); // Deprecated
app.use('/v1/users', addDeprecationHeaders('v1', true, '2025-12-31'), userRoutesV1); // Deprecated
app.use('/v2/auth', addDeprecationHeaders('v2', false), authRoutesV2); // Current version
app.use('/v2/users', addDeprecationHeaders('v2', false), userRoutesV2); // Current version

// Root endpoint to indicate API status
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    versions: {
      v1: { status: 'deprecated', deprecationDate: '2025-12-31' },
      v2: { status: 'active' }
    }
  });
});

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
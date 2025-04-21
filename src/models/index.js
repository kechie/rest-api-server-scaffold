//file models/index.js
// This file initializes Sequelize and defines the database connection.
// It also imports and initializes models, and exports them for use in the application.
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config(); // Load .env variables

// Determine which DATABASE_URL to use based on environment
const env = process.env.NODE_ENV || 'development';
const databaseUrl = {
  development: process.env.DATABASE_URL_DEV,
  test: process.env.DATABASE_URL_TEST,
  production: process.env.DATABASE_URL_PROD,
}[env];

if (!databaseUrl) {
  console.error(`No DATABASE_URL found for NODE_ENV=${env}`);
  process.exit(1);
}

// Create Sequelize instance using DATABASE_URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log, // Enable query logging (optional) set to false to disable/production
  define: {
    underscored: true, // Use snake_case for database columns
  },
  // dialectOptions: {
  //   ssl: env === 'production' ? { require: true, rejectUnauthorized: false } : false,
  // },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00', // Set timezone to PHT
  logging: (msg) => console.log(`[Sequelize] ${msg}`), // Custom logging function
  benchmark: true, // Log query execution time
});

// Test database connection
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected successfully');
  } catch (error) {
    console.error('Sequelize connection error:', error);
    process.exit(1);
  }
}

// Define models
const User = require('./userModel')(sequelize, DataTypes);

// Sync models with database (optional, for development)
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables (careful!)
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  connectToDatabase,
  syncDatabase,
};
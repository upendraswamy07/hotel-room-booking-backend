const mongoose = require('mongoose');
const logger = require('../middleware/winston.logger');

const connectDatabase = async () => {
  try {
    const dbURI = process.env.MONGODB_URL;

    if (!dbURI) {
      throw new Error('MONGODB_URL is not defined in environment variables');
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

module.exports = connectDatabase;

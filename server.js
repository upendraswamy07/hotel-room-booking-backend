/**
 * @name Hotel Room Booking System
 * @description Hotel Room Booking and Management System Software ~ Modified for deployment by Upendra
 * @version v0.0.1
 */

// imports modules & dependencies
const app = require('./src/app');
const logger = require('./src/middleware/winston.logger');

// Use Render's provided PORT env variable or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});

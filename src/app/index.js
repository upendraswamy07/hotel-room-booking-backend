/**
 * @name Hotel Room Booking System
 * @author ...
 * @description ...
 */

require('dotenv').config(); // ✅ Load .env variables
const express = require('express');
const favicon = require('serve-favicon');
const crossOrigin = require('cors');
const cookieParser = require('cookie-parser');
const appRoot = require('app-root-path');
const bodyParser = require('body-parser');
const helmet = require('helmet');

// middleware and routes
const morganLogger = require('../middleware/morgan.logger');
const defaultController = require('../controllers/default.controller');
const { notFoundRoute, errorHandler } = require('../middleware/error.handler');
const { limiter } = require('../middleware/access.limiter');
const corsOptions = require('../configs/cors.config');
const authRoute = require('../routes/auth.routes');
const userRoute = require('../routes/user.routes');
const appsRoute = require('../routes/apps.routes');
const roomRoute = require('../routes/room.routes');
const bookingRoute = require('../routes/booking.route');
const reviewRoute = require('../routes/review.routes');

// initialize express app
const app = express();

// Apply middlewares
app.use(limiter);
const connectDatabase = require('../database/connect.mongo.db');
connectDatabase();

if (process.env.APP_NODE_ENV !== 'production') app.use(morganLogger());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(crossOrigin(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.APP_NODE_ENV !== 'production') {
  app.use(favicon(`${appRoot}/public/favicon.ico`));
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', defaultController);
app.use('/api/v1', authRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', appsRoute);
app.use('/api/v1', roomRoute);
app.use('/api/v1', bookingRoute);
app.use('/api/v1', reviewRoute);

app.use(notFoundRoute);
app.use(errorHandler);

module.exports = app;

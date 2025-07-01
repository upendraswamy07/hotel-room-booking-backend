/**
 * @name Access Limiter Middleware
 * @description Custom rate limiting middleware for API and app access
 */

const path = require('path');
const fs = require('fs');
const appRoot = require('app-root-path');
const rateLimit = require('express-rate-limit');
const FileStreamRotator = require('file-stream-rotator');
const { errorResponse } = require('../configs/app.response');
const currentDateTime = require('../lib/current.date.time');
const logger = require('./winston.logger');

// Ensure limiter logs directory exists
const ensureLogsFolder = (folder) => {
  const baseLogs = path.join(appRoot.path, 'logs');
  const target = path.join(baseLogs, folder);

  if (!fs.existsSync(baseLogs)) fs.mkdirSync(baseLogs);
  if (!fs.existsSync(target)) fs.mkdirSync(target);

  return target;
};

// Custom log handler
const logLimitEvent = (folder, filename, req) => {
  const logDir = ensureLogsFolder(folder);

  const stream = FileStreamRotator.getStream({
    date_format: 'YYYY-MM-DD',
    filename: path.join(logDir, filename),
    frequency: 'daily',
    verbose: false,
  });

  const message = `[${currentDateTime()}]\tTITLE: TOO MANY REQUEST\tMETHOD: ${req.method}\tURL: ${req.url}\tCLIENT: ${req.headers['user-agent']}\n`;
  stream.write(message, 'utf8');
};

// General limiter (for all routes)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000,
  message: { message: 'Too many requests, please try again later.' },
  handler: (req, res, _next, options) => {
    try {
      logLimitEvent('limiter', 'app-limiter-%DATE%.log', req);
    } catch (err) {
      logger.error('API limiter error: ', err);
    }
    res.status(options.statusCode).send(
      errorResponse(29, 'TOO MANY REQUEST', options.message.message)
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific login limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: { message: 'Too many login attempts from this IP, try again after 60 seconds.' },
  handler: (req, res, _next, options) => {
    try {
      logLimitEvent('limiter', 'api-limiter-%DATE%.log', req);
    } catch (err) {
      logger.error('API login limiter error: ', err);
    }
    res.status(options.statusCode).send(
      errorResponse(29, 'TOO MANY REQUEST', options.message.message)
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter, apiLimiter };

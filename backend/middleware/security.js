const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

// set security HTTP headers
exports.secureHeaders = helmet();

// prevent XSS attacks
exports.xssProtection = xss();

// limit requests from same IP
exports.limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
const { body } = require('express-validator');

exports.registerValidator = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('username')
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3-20 characters')
        .escape(),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Country name too long')
        .escape()
];

exports.loginValidator = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];
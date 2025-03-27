const { body } = require('express-validator');

// Common validation rules
const emailRule = body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail();

const passwordRule = body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 8 characters');



// register validation
const registerValidator = [
    emailRule,
    passwordRule,
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    body('country')
        .optional()
        .isString().withMessage('Country must be a string')
        .isLength({ max: 50 }).withMessage('Country name too long')
];

// login validation 
const loginValidator = [
    emailRule,
    passwordRule
];

module.exports = {
    registerValidator,
    loginValidator
};
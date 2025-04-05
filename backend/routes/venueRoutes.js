const express = require('express');
const { checkVenue, createVenue } = require('../controllers/venueController.js');

const router = express.Router();

// Enhanced CORS middleware
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Immediately respond to OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

router.post('/check', checkVenue);
router.post('/', createVenue);

module.exports = router;
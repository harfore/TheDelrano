const express = require('express');
const {
    getCityByNameAndCountry,
    createCity
} = require('../controllers/cityController');

const router = express.Router();

router.get('/', getCityByNameAndCountry);
router.post('/', createCity);
router.get('/debug', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        status: 'OK',
        message: 'Backend is sending proper JSON'
    });
});

module.exports = router;
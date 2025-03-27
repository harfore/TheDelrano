const express = require('express');
const router = express.Router();
const {
    getTour,
    checkTourExists,
    createTour,
    getTourDetails
} = require('../controllers/tourController');

router.route('/')
    .get(getTour)
    .post(createTour);

router.post('/check', checkTourExists);
router.get('/:id', getTourDetails);

module.exports = router;
const express = require('express');
const { checkTourExists, createTour } = require('../controllers/tourController');
const pool = require('../config/database.js');

const router = express.Router();

// event processing routes
router.post('/events/process', async (req, res) => {
    const { dmaId, maxEvents = 50 } = req.body;

    if (!dmaId) {
        return res.status(400).json({ error: 'dmaId is required' });
    }

    try {
        const results = await saveConcertAndTour(dmaId, maxEvents);
        res.json({
            success: true,
            count: results.length,
            processed: results
        });
    } catch (error) {
        console.error('Processing failed:', error);
        res.status(500).json({
            error: 'Event processing failed',
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
});

router.get('/events/verify', async (req, res) => {
    try {
        const [{ count: concertCount }] = (await pool.query(
            `SELECT COUNT(*) FROM concerts 
             WHERE date > NOW() - INTERVAL '1 day'`
        )).rows;

        const [latestTour] = (await pool.query(
            `SELECT name, start_date FROM tours 
             ORDER BY created_at DESC LIMIT 1`
        )).rows;

        res.json({
            concertCount: parseInt(concertCount),
            latestTour: latestTour || null,
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        console.error('Verification failed:', error);
        res.status(500).json({ error: 'Verification check failed' });
    }
});

// tour CRUD routes
router.route('/')
    .get(async (req, res) => {
        try {
            const { rows } = await pool.query(
                `SELECT tour_id as id, name, start_date 
                 FROM tours ORDER BY start_date DESC`
            );
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tours' });
        }
    })
    .post(createTour);

router.get('/:id', async (req, res) => {
    try {
        const { rows: [tour] } = await pool.query(
            `SELECT 
                tour_id as id,
                name,
                artist_id,
                start_date,
                end_date
             FROM tours 
             WHERE tour_id = $1`,
            [req.params.id]
        );
        res.json(tour || { error: 'Tour not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tour' });
    }
});

router.post('/check', checkTourExists);

module.exports = router;

// const router = express.Router();
// const {
//     getTour,
//     checkTourExists,
//     createTour,
//     getTourDetails
// } = require('../controllers/tourController');
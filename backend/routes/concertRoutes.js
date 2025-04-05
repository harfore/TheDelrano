const express = require('express');
const { checkConcertExists, createConcert } = require('../controllers/concertController.js');
const pool = require('../config/database.js');

const router = express.Router();

// existence check
router.post('/exists', checkConcertExists);

// CRUD operations
router.route('/')
    .post(createConcert)
    .get(async (req, res) => {
        try {
            const { rows } = await pool.query(
                `SELECT 
                    concert_id AS id,
                    tour_id,
                    venue_id,
                    date
                 FROM concerts
                 ORDER BY date DESC`
            );
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch concerts' });
        }
    });

// get concert by ID
router.get('/:id', async (req, res) => {
    try {
        const { rows: [concert] } = await pool.query(
            `SELECT * FROM concerts WHERE concert_id = $1`,
            [req.params.id]
        );
        concert ? res.json(concert) : res.status(404).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch concert' });
    }
});

module.exports = router;
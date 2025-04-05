const pool = require('../config/database');

const checkConcertExists = async (req, res) => {
    const { tour_id, venue_id, date } = req.body;

    // add validation
    if (!tour_id || !venue_id || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // extract just the date portion if ISO string is sent
        const dateOnly = new Date(date).toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT concert_id FROM concerts 
             WHERE tour_id = $1 AND venue_id = $2 AND date::date = $3`,
            [tour_id, venue_id, dateOnly]
        );

        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        console.error('Error checking concert existence:', err);
        res.status(500).json({ error: 'Database operation failed' });
    }
};

const createConcert = async (req, res) => {
    const { tour_id, venue_id, date, special_notes } = req.body;

    // validate required fields
    if (!tour_id || !venue_id || !date) {
        return res.status(400).json({
            error: 'tour_id, venue_id, and date are required'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO concerts (
                tour_id,
                venue_id,
                date,
                special_notes,
                user_count,
                review_count
            ) VALUES ($1, $2, $3, $4, 0, 0)
            RETURNING concert_id AS id`,
            [tour_id, venue_id, date, special_notes || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique violation
            return res.status(409).json({
                error: 'Concert already exists for this tour/venue/date'
            });
        }
        console.error('Concert creation failed:', err);
        res.status(500).json({ error: 'Failed to create concert' });
    }
};

module.exports = { checkConcertExists, createConcert };
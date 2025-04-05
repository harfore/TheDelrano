const pool = require('../config/database');

const checkTourExists = async (req, res) => {
    const { name, artist_id, start_date } = req.body;

    try {
        const result = await pool.query(
            `SELECT tour_id as id FROM tours 
       WHERE name = $1 AND artist_id = $2 AND start_date = $3`,
            [name, artist_id, start_date]
        );

        res.json({
            exists: result.rows.length > 0,
            id: result.rows[0]?.id
        });
    } catch (err) {
        console.error('Tour existence check failed:', err);
        res.status(500).json({ error: 'Database operation failed' });
    }
};

const createTour = async (req, res) => {
    const {
        name,
        artist_id,
        start_date,
        end_date,
        description = null,
        image_urls = null,
        is_live_album = false,
        is_concert_film = false
    } = req.body;

    const errors = [];
    if (!name) errors.push('name is required');
    if (!artist_id) errors.push('artist_id is required');
    if (!start_date) errors.push('start_date is required');
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const existsRes = await pool.query(
            `SELECT tour_id FROM tours 
       WHERE name = $1 AND artist_id = $2 AND start_date = $3`,
            [name, artist_id, start_date]
        );

        if (existsRes.rows.length > 0) {
            return res.status(409).json({
                error: 'Tour already exists',
                id: existsRes.rows[0].tour_id
            });
        }

        const result = await pool.query(
            `INSERT INTO tours (
        name, artist_id, start_date, end_date,
        description, image_urls, 
        is_live_album, is_concert_film
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING tour_id AS id`,
            [
                name, artist_id, start_date, end_date,
                description, image_urls,
                is_live_album, is_concert_film
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Tour already exists' });
        }
        console.error('Tour creation error:', err);
        res.status(500).json({ error: 'Failed to create tour' });
    }
};

module.exports = { checkTourExists, createTour };
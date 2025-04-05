const pool = require('../config/database');

const getCityByNameAndCountry = async (req, res) => {
    const { name, country } = req.query;

    if (!name || !country) {
        return res.status(400).json({
            error: 'Both city name and country are required',
            received: { name, country }
        });
    }

    try {
        const result = await pool.query(
            `SELECT city_id as id, name, country, dma_id
             FROM cities 
             WHERE name = $1 AND country = $2`,
            [name, country]
        );


        res.setHeader('Content-Type', 'application/json');
        res.json(result.rows[0] || null);

    } catch (err) {
        console.error('City lookup failed:', err);

        res.status(500).json({
            error: 'Database operation failed',
            details: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });

    }
};

const createCity = async (req, res) => {
    try {
        const { name, dma_id, country, state_province } = req.body;

        // validate required fields
        if (!name || !country) {
            return res.status(400).json({
                error: 'City name and country are required',
                required: ['name', 'country'],
                received: Object.keys(req.body)
            });
        }

        // check for existing city first
        const existsRes = await pool.query(
            `SELECT city_id FROM cities 
             WHERE name = $1 AND country = $2`,
            [name, country]
        );

        if (existsRes.rows.length > 0) {
            return res.status(409).json({
                error: 'City already exists',
                id: existsRes.rows[0].city_id
            });
        }

        // create new city
        const result = await pool.query(
            `INSERT INTO cities (name, dma_id, country, state_province)
             VALUES ($1, $2, $3, $4)
             RETURNING city_id AS id`,
            [
                name,
                dma_id ? parseInt(dma_id) : null,
                country,
                state_province || null
            ]
        );

        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'City already exists',
                suggestion: 'Try updating instead of creating'
            });
        }
        console.error('City creation error:', err);

        res.status(500).json({
            error: 'Database operation failed',
            details: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });

    }
};

module.exports = { getCityByNameAndCountry, createCity };
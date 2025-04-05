const pool = require('../config/database.js');

const checkVenue = async (req, res) => {
    const { name, city_id } = req.body;

    const result = await pool.query(
        `SELECT venue_id FROM venues 
       WHERE name = $1 AND city_id = $2`,
        [name, city_id]
    );

    res.json({
        exists: result.rows.length > 0,
        id: result.rows[0]?.venue_id
    });
};

const createVenue = async (req, res) => {
    const { name, city_id, state, country } = req.body;

    const result = await pool.query(
        `INSERT INTO venues (name, city_id, state, country)
       VALUES ($1, $2, $3, $4)
       RETURNING venue_id AS id`,
        [name, city_id, state, country]
    );

    res.status(201).json(result.rows[0]);
};

module.exports = { checkVenue, createVenue };
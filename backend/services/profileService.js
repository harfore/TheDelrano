const getProfile = async (userId, pool) => {
    const result = await pool.query(
        'SELECT handle, country, pronouns, bio FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
};

const updateProfile = async (userId, updateData, pool) => {
    const { handle, country, pronouns, bio } = updateData;

    const result = await pool.query(
        `UPDATE users 
         SET handle = $1, country = $2, pronouns = $3, bio = $4 
         WHERE id = $5 
         RETURNING handle, country, pronouns, bio`,
        [handle, country, pronouns, bio, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Update failed');
    }

    return result.rows[0];
};

module.exports = { getProfile, updateProfile };
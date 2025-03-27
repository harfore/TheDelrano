const bcrypt = require('bcrypt');

// in-memory "database"
const mockUsers = [];

const pool = {
    query: async (sql, params) => {
        if (sql.includes('INSERT INTO users')) {
            const [email, username, password, country] = params;
            const newUser = {
                id: mockUsers.length + 1,
                email,
                username,
                password,
                country
            };
            mockUsers.push(newUser);
            return { rows: [newUser] };
        }

        if (sql.includes('SELECT * FROM users WHERE email')) {
            const [email] = params;
            const user = mockUsers.find(u => u.email === email);
            return { rows: user ? [user] : [] };
        }

        throw new Error('Mock query not implemented');
    }
};

module.exports = pool;
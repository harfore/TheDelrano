const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
    register: async (req, res) => {
        try {
            const { email, username, password, country } = req.body;

            if (!email || !username || !password) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (email, username, password, country) VALUES ($1, $2, $3, $4) RETURNING *',
                [email, username, hashedPassword, country]
            );

            const token = jwt.sign(
                { id: result.rows[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(201).json({
                user: result.rows[0],
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: error.message.includes('unique')
                    ? 'Email or username already exists'
                    : 'Registration failed'
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // allow login with either email or username
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1 OR username = $1',
                [email]
            );

            const user = result.rows[0];
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const { password: _, ...userWithoutPassword } = user;
            res.json({
                success: true,
                token,
                user: {
                    userId: user.id,  // Consistent with verify endpoint
                    username: user.username,
                    email: user.email
                },
                message: 'Login successful'
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    },

    verify: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({
                success: false,
                message: 'No token provided'
            });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            const result = await pool.query(
                'SELECT id, username, email FROM users WHERE id = $1',
                [userId]
            );

            const user = result.rows[0];
            if (!user) return res.status(401).json({
                success: false,
                message: 'User not found'
            });

            res.json({
                success: true,
                user: {
                    userId: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Token verification error:', error);

            let message = 'Invalid token';
            if (error.name === 'TokenExpiredError') {
                message = 'Token expired';
            } else if (error.name === 'JsonWebTokenError') {
                message = 'Invalid token';
            }

            res.status(401).json({
                success: false,
                message
            });
        }
    }
};

module.exports = authController;
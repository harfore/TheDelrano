require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const pool = require('./config/database');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
// const tourRoutes = require('./routes/toursRoutes');
// const concertRoutes = require('./routes/concertsRoutes');

app.get('*.js', (req, res, next) => {
    res.set('Content-Type', 'application/javascript');
    next();
});

app.get('/db-info', async (req, res) => {
    try {
        const dbInfo = await pool.query(`
        SELECT current_database(), current_schema();
      `);
        const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = current_schema()
      `);
        res.json({
            currentDatabase: dbInfo.rows[0].current_database,
            currentSchema: dbInfo.rows[0].current_schema,
            tables: tables.rows.map(t => t.table_name)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Import middleware
const { secureHeaders, xssProtection, limiter } = require('./middleware/security');
const specs = require('./config/swagger');

// 1° Security middleware (Helmet + custom)
app.use(helmet());
app.use(secureHeaders);
app.use(xssProtection);

// 2° Request logging
app.use(morgan('dev'));

// 3° CORS configuration (simplified)
// app.use(cors({
//     origin: '*', // Allows all origins
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: false // Must be false when origin is '*'
// }));
app.use(cors());

// 4° Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5° Rate limiting
app.use('/api', limiter);

// 6° Health check endpoint (single implementation)
app.get('/health', (req, res) => res.status(200).send('OK'));

// 7° API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 8° API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/tours', tourRoutes);
// app.use('/api/concerts', concertRoutes);

// 9° Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running',
        documentation: '/api-docs',
        health_check: '/health'
    });
});

// 10° Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 11° Handle 404s (must be after all other routes)
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    });
});

// 12° Error handler (must be last middleware)
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    const message = err.message || 'Something went wrong';

    res.status(statusCode).json({
        status,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
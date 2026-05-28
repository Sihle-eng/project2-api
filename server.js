const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('DB_NAME from .env:', process.env.DB_NAME);

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');


const authRoutes = require('./routes/auth');
console.log('Auth routes object:', authRoutes);
console.log('Auth routes type:', typeof authRoutes);

const authenticateToken = require('./middleware/auth');
const itemsRoutes = require('./routes/items');
const customersRoutes = require('./routes/customers');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/auth', authRoutes);

// Protected routes (require token)
app.use('/api/items', authenticateToken, itemsRoutes);
app.use('/api/customers', authenticateToken, customersRoutes);

// Test route (public)
app.get('/test', (req, res) => {
    res.json({ message: 'Express is working!' });
});

// Debug routes (public)
app.get('/debug-routes', (req, res) => {
    res.json({ message: 'Server is running', registeredRoutes: app._router.stack.filter(r => r.route).map(r => r.route.path) });
});

// Home route (public)
app.get('/', (req, res) => {
    res.json({
        message: 'Project 2 API is running!',
        endpoints: {
            docs: 'GET /api-docs',
            items: 'GET /api/items',
            customers: 'GET /api/customers'
        }
    });
});

// Swagger setup
let swaggerUi, swaggerSpecs;
try {
    swaggerUi = require('swagger-ui-express');
    const swaggerJsdoc = require('swagger-jsdoc');
    
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Project 2 API - CRUD Operations',
                version: '1.0.0',
                description: 'API for managing items and customers collections with validation and authentication'
            },
        },
        apis: ['./routes/*.js'],
    };
    
    swaggerSpecs = swaggerJsdoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
    console.log('Swagger UI mounted at /api-docs');
} catch (error) {
    console.error('Swagger error:', error.message);
}

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(` API Docs: http://localhost:${PORT}/api-docs`);
        console.log(` Items API: http://localhost:${PORT}/api/items (protected)`);
        console.log(` Customers API: http://localhost:${PORT}/api/customers (protected)`);
    });
}).catch(err => {
    console.error('Failed to start:', err.message);
    process.exit(1);
});
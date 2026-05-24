const path = require('path');
// Load .env ONLY from the current project folder
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug (optional – remove later)
console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('DB_NAME from .env:', process.env.DB_NAME);

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
const PORT = 3000; 

console.log('PORT from env:', process.env.PORT);
console.log('MONGODB_URI from env:', process.env.MONGODB_URI);
console.log('DB_NAME from env:', process.env.DB_NAME);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Express is working!' });
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
                description: 'API for managing items collection with validation'
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

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Project 2 API is running!',
        endpoints: {
            docs: 'GET /api-docs',
            items: 'GET /api/items'
        }
    });
});

// Items routes
const itemsRoutes = require('./routes/items');
app.use('/api/items', itemsRoutes);

app.get('/debug-routes', (req, res) => {
    res.json({ message: 'Server is running', registeredRoutes: app._router.stack.filter(r => r.route).map(r => r.route.path) });
});

const customersRoutes = require('./routes/customers');
app.use('/api/customers', customersRoutes);

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(` API Docs: http://localhost:${PORT}/api-docs`);
        console.log(` Items API: http://localhost:${PORT}/api/items`);
    });
}).catch(err => {
    console.error('Failed to start:', err.message);
    process.exit(1);
});
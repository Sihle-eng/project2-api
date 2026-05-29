const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('DB_NAME from .env:', process.env.DB_NAME);

const express = require('express');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const { connectDB, getClient, getUsersCollection } = require('./db');

const authRoutes = require('./routes/auth');
console.log('Auth routes object:', authRoutes);
console.log('Auth routes type:', typeof authRoutes);

const authenticateToken = require('./middleware/auth');
const itemsRoutes = require('./routes/items');
const customersRoutes = require('./routes/customers');

const app = express();
const PORT = 3000;

//Session store
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        clientPromise: connectDB().then(() => getClient()),
        dbName: 'project2DB',
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://project2-api-iv7w.onrender.com/auth/github/callback' 
        : 'http://localhost:3000/auth/github/callback',
    scope: 'user:email'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const usersCollection = getUsersCollection();
        let user = await usersCollection.findOne({ githubId: profile.id });
        if (!user) {
            user = {
                githubId: profile.id,
                displayName: profile.displayName,
                username: profile.username,
                email: profile.emails?.[0]?.value || null,
                provider: 'github',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await usersCollection.insertOne(user);
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({ _id: id });
    done(null, user);
});

//CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// browser auth routes
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login</title></head>
        <body>
            <h1>Welcome to My API</h1>
            <a href="/auth/github">Login with GitHub</a>
        </body>
        </html>
    `);
});

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/api-docs');
    }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/items', authenticateToken, itemsRoutes);
app.use('/api/customers', authenticateToken, customersRoutes);

// debug routes (public)
app.get('/test', (req, res) => {
    res.json({ message: 'Express is working!' });
});

app.get('/debug-routes', (req, res) => {
    res.json({ message: 'Server is running', registeredRoutes: app._router.stack.filter(r => r.route).map(r => r.route.path) });
});

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

//Swagger
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
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const { getUsersCollection } = require('../db');
const { message } = require('statuses');

const router = express.Router();
router.get('/ping', (req, res) => {
    res.json({ message: 'Auth router is alive!' });
});
const JWT_SECRET = process.env.JWT_SECRET;

//validation rules for registration
const validateRegister = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required')
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

//post  /auth/register
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const users = getUsersCollection();

        const existing = await users.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user document
        const newUser = {
            email,
            password: hashedPassword,
            name,
            provider: 'local',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null
        }

        const result = await users.insertOne(newUser);
        const createdUser = await users.findOne({ _id: result.insertedId });
        delete createdUser.password; 

        res.status(201).json({ message: 'User registered successfully', user: createdUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//post /auth/login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = getUsersCollection();

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //update last login
        await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

        //create jwt token
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//post /auth/logout
router.post('/logout', (req, res) => {
    // For JWT, logout is handled client-side by deleting the token
    res.json({ message: 'Logout successful' });
});

module.exports = router;
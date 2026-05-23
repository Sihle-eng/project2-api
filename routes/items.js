const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemsController');

const router = express.Router();

// Validation rules for item fields
const validateItem = [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('author').notEmpty().withMessage('Author is required').isString(),
    body('year').isInt({ min: 1000, max: 2025 }).withMessage('Year must be between 1000 and 2025'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('pages').isInt({ min: 1 }).withMessage('Pages must be at least 1'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('inStock').optional().isBoolean().withMessage('inStock must be a boolean')
];

const validateId = [
    param('id').isMongoId().withMessage('Invalid item ID format')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', getAllItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get an item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item found
 *       404:
 *         description: Item not found
 */
router.get('/:id', validateId, handleValidationErrors, getItemById);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - year
 *               - genre
 *               - pages
 *               - price
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               year: { type: number }
 *               genre: { type: string }
 *               pages: { type: number }
 *               price: { type: number }
 *               inStock: { type: boolean }
 *     responses:
 *       201:
 *         description: Item created
 *       400:
 *         description: Validation error
 */
router.post('/', validateItem, handleValidationErrors, createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               year: { type: number }
 *               genre: { type: string }
 *               pages: { type: number }
 *               price: { type: number }
 *               inStock: { type: boolean }
 *     responses:
 *       200:
 *         description: Item updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found
 */
router.put('/:id', validateId, validateItem, handleValidationErrors, updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */
router.delete('/:id', validateId, handleValidationErrors, deleteItem);

module.exports = router;
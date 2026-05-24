const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customersController');

const router = express.Router();

// Validation rules (at least 7 fields)
const validateCustomer = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('zipCode').optional().isString(),
    body('membershipLevel').optional().isIn(['Bronze', 'Silver', 'Gold']).withMessage('Membership level must be Bronze, Silver, or Gold'),
    body('dateJoined').optional().isISO8601().toDate()
];

const validateId = [
    param('id').isMongoId().withMessage('Invalid customer ID format')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer found
 *       404:
 *         description: Customer not found
 */
router.get('/:id', validateId, handleValidationErrors, getCustomerById);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zipCode: { type: string }
 *               membershipLevel: { type: string, enum: ['Bronze','Silver','Gold'] }
 *               dateJoined: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Customer created
 *       400:
 *         description: Validation error
 */
router.post('/', validateCustomer, handleValidationErrors, createCustomer);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zipCode: { type: string }
 *               membershipLevel: { type: string }
 *     responses:
 *       200:
 *         description: Customer updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 */
router.put('/:id', validateId, validateCustomer, handleValidationErrors, updateCustomer);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 */
router.delete('/:id', validateId, handleValidationErrors, deleteCustomer);

module.exports = router;
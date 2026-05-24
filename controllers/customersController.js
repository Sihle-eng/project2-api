const { getCustomersCollection } = require('../db');
const { ObjectId } = require('mongodb');

// GET all customers
const getAllCustomers = async (req, res) => {
    try {
        const collection = getCustomersCollection();
        const customers = await collection.find({}).toArray();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single customer by ID
const getCustomerById = async (req, res) => {
    try {
        const collection = getCustomersCollection();
        const customer = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST create a new customer
const createCustomer = async (req, res) => {
    try {
        const collection = getCustomersCollection();
        const newCustomer = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(newCustomer);
        const created = await collection.findOne({ _id: result.insertedId });
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT update a customer
const updateCustomer = async (req, res) => {
    try {
        const collection = getCustomersCollection();
        const { id } = req.params;
        const updated = {
            ...req.body,
            updatedAt: new Date()
        };
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updated }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Customer not found' });
        const customer = await collection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE a customer
const deleteCustomer = async (req, res) => {
    try {
        const collection = getCustomersCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
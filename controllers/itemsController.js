const { getItemsCollection } = require('../db');
const { ObjectId } = require('mongodb');

// GET all items
const getAllItems = async (req, res) => {
    try {
        const collection = getItemsCollection();
        const items = await collection.find({}).toArray();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single item by ID
const getItemById = async (req, res) => {
    try {
        const collection = getItemsCollection();
        const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST create a new item
const createItem = async (req, res) => {
    try {
        const collection = getItemsCollection();
        const newItem = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(newItem);
        const createdItem = await collection.findOne({ _id: result.insertedId });
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT update an item
const updateItem = async (req, res) => {
    try {
        const collection = getItemsCollection();
        const { id } = req.params;
        const updatedItem = {
            ...req.body,
            updatedAt: new Date()
        };
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedItem }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Item not found' });
        const item = await collection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE an item
const deleteItem = async (req, res) => {
    try {
        const collection = getItemsCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
};
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = 'project2DB';

let client;
let db;

async function connectDB() {
    try {
        if (client && client.topology && client.topology.isConnected()) {
            return db;
        }

        console.log('Connecting to MongoDB...');
        
        // Remove deprecated options – they are no longer needed
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 30000
        });

        await client.connect();
        console.log('Connected to MongoDB successfully!');
        
        db = client.db(dbName);
        console.log(`Using database: ${dbName}`);
        
        // Create items collection if it doesn't exist
        const collections = await db.listCollections({ name: 'items' }).toArray();
        if (collections.length === 0) {
            await db.createCollection('items');
            console.log('Created items collection');
        }
        
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db;
}

function getItemsCollection() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db.collection('items');
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
}
function getCustomersCollection() {
    if (!db) throw new Error('Database not connected');
    return db.collection('customers');
}
module.exports = { connectDB, getDB, getItemsCollection, getCustomersCollection, closeDB };
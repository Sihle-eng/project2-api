require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

console.log('Testing URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connection successful');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
});
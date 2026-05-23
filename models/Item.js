const mongoose = require('mongoose');

const itemValidationRules = {
    title: { required: true, type: 'string', min: 1, max: 100 },
    author: { required: true, type: 'string', min: 1, max: 100 },
    year: { required: true, type: 'number', min: 1000, max: 2025 },
    genre: { required: true, type: 'string' },
    pages: { required: true, type: 'number', min: 1 },
    price: { required: true, type: 'number', min: 0 },
    inStock: { required: false, type: 'boolean', default: true }
};

module.exports = { itemValidationRules };

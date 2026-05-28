const userValidationRules = {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', min: 6 },
    name: { required: true, type: 'string' },
};

module.exports = { userValidationRules };
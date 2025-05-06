const crypto = require('crypto');

// Generate a secure random 32-byte key
const secretKey = crypto.randomBytes(32).toString('hex');

// Print the generated JWT secret key
console.log('Generated JWT Secret Key:', secretKey);

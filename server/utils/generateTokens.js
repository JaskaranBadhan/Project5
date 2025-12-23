const jwt = require('jsonwebtoken');
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret_access_key',
        { expiresIn: '15m' }
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || 'secret_refresh_key',
        { expiresIn: '7d' }
    );
};
module.exports = { generateAccessToken, generateRefreshToken };
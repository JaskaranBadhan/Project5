const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password
        });
        if (user) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.refresh_token = refreshToken;
            await user.save();
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password is wrong' });
        }
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refresh_token = refreshToken;
        await user.save();
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token found' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.refresh_token !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};
const logoutUser = async (req, res) => {
    if (req.user) {
        req.user.refresh_token = null;
        await req.user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
};
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};
module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    getMe
};
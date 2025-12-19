const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        console.log('🔍 Decoded token:', decoded);

        // Find user by id (token uses 'id', not 'userId')
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.error('❌ User not found for id:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('✅ User authenticated:', user.email);

        // Attach user to request (with both user object and id for compatibility)
        req.user = {
            ...user.toObject(),
            id: user._id.toString()
        };
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;

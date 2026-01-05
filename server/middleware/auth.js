// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'No token, authorization denied'
            });
        }
        
        // Extract token
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user to request - FIXED: use 'id' not 'userid'
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Token is not valid'
        });
    }
};

// Export both as default and named export for flexibility
module.exports = auth;
module.exports.auth = auth;
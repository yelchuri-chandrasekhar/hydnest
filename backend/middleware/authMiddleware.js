const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const ownerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied, owners only' });
    }
};

const tenantOnly = (req, res, next) => {
    if (req.user && req.user.role === 'tenant') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied, tenants only' });
    }
};

module.exports = { protect, ownerOnly, tenantOnly };
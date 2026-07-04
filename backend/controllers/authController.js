const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Register
const register = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    try {
        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists!' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, hashedPassword, phone, role]
        );

        const user = newUser.rows[0];
        const token = generateToken(user.id, user.email, user.role);

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User not found!' });
        }

        const user = userResult.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password!' });
        }

        const token = generateToken(user.id, user.email, user.role);

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found!' });
        }

        res.status(200).json({ user: userResult.rows[0] });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, getMe };
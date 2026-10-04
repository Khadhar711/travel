const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.register = (req, res) => {
    const { username, email, password, user_type } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    const type = user_type || 'explorer';

    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Error processing password hash.' });
        }

        const sql = `INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)`;
        db.run(sql, [username.trim(), email.trim().toLowerCase(), hash, type], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username or email already registered.' });
                }
                return res.status(500).json({ error: err.message });
            }

            const token = jwt.sign(
                { id: this.lastID, username, email, user_type: type },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                message: 'User registered successfully!',
                token,
                user: {
                    id: this.lastID,
                    username,
                    email,
                    user_type: type
                }
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`;
    db.get(sql, [identifier, identifier], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid username/email or password.' });
        }

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Authentication error.' });
            }

            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid username/email or password.' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, email: user.email, user_type: user.user_type },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                message: 'Login successful!',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    user_type: user.user_type
                }
            });
        });
    });
};

exports.socialLogin = (req, res) => {
    const { provider, socialName, email, user_type } = req.body;

    if (!provider) {
        return res.status(400).json({ error: 'Social provider is required.' });
    }

    const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    const username = socialName ? socialName.trim() : `${formattedProvider} User`;
    const userEmail = email ? email.trim().toLowerCase() : `${username.toLowerCase().replace(/\s+/g, '')}@${provider.toLowerCase()}.com`;
    const type = user_type || 'explorer';

    const checkSql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`;
    db.get(checkSql, [userEmail, username], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existingUser) {
            const token = jwt.sign(
                { id: existingUser.id, username: existingUser.username, email: existingUser.email, user_type: existingUser.user_type },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                message: `Logged in via ${formattedProvider}!`,
                token,
                user: {
                    id: existingUser.id,
                    username: existingUser.username,
                    email: existingUser.email,
                    user_type: existingUser.user_type
                }
            });
        }

        const dummyPasswordHash = bcrypt.hashSync(`social_${Date.now()}_${Math.random()}`, 10);
        const insertSql = `INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)`;
        db.run(insertSql, [username, userEmail, dummyPasswordHash, type], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const token = jwt.sign(
                { id: this.lastID, username, email: userEmail, user_type: type },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                message: `Registered & Logged in via ${formattedProvider}!`,
                token,
                user: {
                    id: this.lastID,
                    username,
                    email: userEmail,
                    user_type: type
                }
            });
        });
    });
};

exports.getMe = (req, res) => {
    const sql = `SELECT id, username, email, user_type, created_at FROM users WHERE id = ?`;
    db.get(sql, [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user });
    });
};

exports.resetPassword = (req, res) => {
    const { email, username, newPassword } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !newPassword) {
        return res.status(400).json({ error: 'Username/Email and new password are required.' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    const checkSql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`;
    db.get(checkSql, [identifier, identifier], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'No account found with this username or email.' });
        }

        bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Error encrypting new password.' });
            }

            const updateSql = `UPDATE users SET password_hash = ? WHERE id = ?`;
            db.run(updateSql, [hash, user.id], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                return res.json({
                    message: 'Password reset successful! You can now log in with your new password.',
                    username: user.username
                });
            });
        });
    });
};


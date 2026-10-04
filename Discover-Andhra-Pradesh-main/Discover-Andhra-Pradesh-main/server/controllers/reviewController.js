const db = require('../config/db');

exports.getReviewsByLocation = (req, res) => {
    const { locationId } = req.params;
    const sql = `SELECT id, username, rating, comment, created_at FROM reviews WHERE location_id = ? ORDER BY created_at DESC`;
    db.all(sql, [locationId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ reviews: rows });
    });
};

exports.addReview = (req, res) => {
    const userId = req.user.id;
    const username = req.user.username;
    const { location_id, rating, comment } = req.body;

    if (!location_id || !rating || !comment) {
        return res.status(400).json({ error: 'Location ID, rating (1-5), and comment are required.' });
    }

    const sql = `INSERT INTO reviews (user_id, username, location_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [userId, username, location_id, parseInt(rating), comment.trim()], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Review posted successfully!',
            review: {
                id: this.lastID,
                username,
                location_id,
                rating: parseInt(rating),
                comment: comment.trim(),
                created_at: new Date().toISOString()
            }
        });
    });
};

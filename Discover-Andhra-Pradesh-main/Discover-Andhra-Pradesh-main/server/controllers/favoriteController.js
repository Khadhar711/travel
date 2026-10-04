const db = require('../config/db');

exports.toggleFavorite = (req, res) => {
    const userId = req.user.id;
    const { location_id } = req.body;

    if (!location_id) {
        return res.status(400).json({ error: 'location_id is required' });
    }

    const checkSql = `SELECT * FROM favorites WHERE user_id = ? AND location_id = ?`;
    db.get(checkSql, [userId, location_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Remove from wishlist
            const deleteSql = `DELETE FROM favorites WHERE user_id = ? AND location_id = ?`;
            db.run(deleteSql, [userId, location_id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Removed from Wishlist', isFavorite: false, location_id });
            });
        } else {
            // Add to wishlist
            const insertSql = `INSERT INTO favorites (user_id, location_id) VALUES (?, ?)`;
            db.run(insertSql, [userId, location_id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Saved to Wishlist!', isFavorite: true, location_id });
            });
        }
    });
};

exports.getUserFavorites = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT l.* FROM locations l
        INNER JOIN favorites f ON l.id = f.location_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ favorites: rows });
    });
};

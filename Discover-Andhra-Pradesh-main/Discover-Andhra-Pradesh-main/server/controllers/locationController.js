const db = require('../config/db');

exports.getAllLocations = (req, res) => {
    const { type, search } = req.query;
    let sql = `SELECT * FROM locations WHERE 1=1`;
    const params = [];

    if (type && type !== 'all') {
        sql += ` AND type = ?`;
        params.push(type.toLowerCase());
    }

    if (search) {
        sql += ` AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(district) LIKE ?)`;
        const term = `%${search.toLowerCase()}%`;
        params.push(term, term, term);
    }

    sql += ` ORDER BY name ASC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ locations: rows });
    });
};

exports.getLocationById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM locations WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ location: row });
    });
};

exports.createLocation = (req, res) => {
    const { name, type, district, description, imageUrl } = req.body;

    if (!name || !type || !description) {
        return res.status(400).json({ error: 'Name, type, and description are required.' });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const sql = `INSERT INTO locations (id, name, type, district, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, name, type.toLowerCase(), district || '', description, imageUrl || ''], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Location created successfully!',
            location: { id, name, type, district, description, imageUrl }
        });
    });
};

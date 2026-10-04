const db = require('../config/db');

exports.getWeatherByLocation = (req, res) => {
    const { locationId } = req.params;
    const sql = `SELECT id, name, temp_c, best_time, type FROM locations WHERE id = ?`;
    db.get(sql, [locationId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Location not found for weather' });
        }

        const temp = row.temp_c || 26;
        let condition = 'Pleasant & Clear';
        let icon = '🌤️';

        if (temp <= 22) {
            condition = 'Cool Hill Breeze';
            icon = '🏔️';
        } else if (temp >= 29) {
            condition = 'Warm & Sunny';
            icon = '☀️';
        }

        res.json({
            location: row.name,
            temp_c: temp,
            temp_f: Math.round((temp * 9/5) + 32),
            condition,
            icon,
            best_time: row.best_time || 'October to March',
            humidity: '65%'
        });
    });
};

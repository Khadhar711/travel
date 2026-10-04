const db = require('../config/db');

exports.createBooking = (req, res) => {
    const userId = req.user.id;
    const { location_id, location_name, travel_date, guests, contact_phone, notes, payment_method, total_amount, txn_id } = req.body;

    if (!location_id || !travel_date) {
        return res.status(400).json({ error: 'Location and travel date are required.' });
    }

    const bookingRef = `APTDC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTxnId = txn_id || `TXN-${Date.now().toString().slice(-6)}`;
    const finalMethod = payment_method || 'UPI (Google Pay)';
    const finalTotal = total_amount || ((guests || 1) * 1250);

    const sql = `
        INSERT INTO bookings (user_id, location_id, location_name, travel_date, guests, contact_phone, notes, status, booking_ref, txn_id, payment_method, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)
    `;

    db.run(sql, [
        userId,
        location_id,
        location_name || location_id,
        travel_date,
        guests || 1,
        contact_phone || '',
        notes || '',
        bookingRef,
        finalTxnId,
        finalMethod,
        finalTotal
    ], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Booking reservation confirmed!',
            booking: {
                id: this.lastID,
                user_id: userId,
                location_id,
                location_name: location_name || location_id,
                travel_date,
                guests: guests || 1,
                contact_phone: contact_phone || '',
                notes: notes || '',
                status: 'confirmed',
                booking_ref: bookingRef,
                txn_id: finalTxnId,
                payment_method: finalMethod,
                total_amount: finalTotal,
                created_at: new Date().toISOString()
            }
        });
    });
};

exports.getUserBookings = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ bookings: rows });
    });
};

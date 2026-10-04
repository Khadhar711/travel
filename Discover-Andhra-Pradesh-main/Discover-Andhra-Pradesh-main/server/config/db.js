const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const initialLocations = require('../data/initialLocations');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            user_type TEXT DEFAULT 'explorer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Locations table
    db.run(`
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            district TEXT,
            description TEXT,
            imageUrl TEXT,
            latitude REAL,
            longitude REAL,
            best_time TEXT,
            temp_c INTEGER,
            video_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ensure columns exist on older database files
    const newCols = [
        ['latitude', 'REAL'],
        ['longitude', 'REAL'],
        ['best_time', 'TEXT'],
        ['temp_c', 'INTEGER'],
        ['video_id', 'TEXT']
    ];

    newCols.forEach(([col, type]) => {
        db.run(`ALTER TABLE locations ADD COLUMN ${col} ${type}`, () => {});
    });

    // Seed or update location data
    db.get('SELECT COUNT(*) AS count FROM locations', (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('Seeding initial location data into SQLite...');
            const stmt = db.prepare(`
                INSERT INTO locations (id, name, type, district, description, imageUrl, latitude, longitude, best_time, temp_c, video_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            initialLocations.forEach(loc => {
                stmt.run(loc.id, loc.name, loc.type, loc.district || '', loc.description, loc.imageUrl, loc.latitude, loc.longitude, loc.best_time, loc.temp_c, loc.video_id);
            });
            stmt.finalize();
            console.log('Successfully seeded', initialLocations.length, 'locations.');
        } else {
            const stmt = db.prepare(`
                UPDATE locations SET latitude = ?, longitude = ?, best_time = ?, temp_c = ?, video_id = ? WHERE id = ?
            `);
            initialLocations.forEach(loc => {
                stmt.run(loc.latitude, loc.longitude, loc.best_time, loc.temp_c, loc.video_id, loc.id, (err) => {
                    // ignore if missing field during first run
                });
            });
            stmt.finalize();
        }
    });

    // Bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            location_id TEXT NOT NULL,
            location_name TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            guests INTEGER DEFAULT 1,
            contact_phone TEXT,
            notes TEXT,
            status TEXT DEFAULT 'confirmed',
            booking_ref TEXT,
            txn_id TEXT,
            payment_method TEXT DEFAULT 'UPI',
            total_amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Ensure columns exist on older booking databases
    const bookingCols = [
        ['booking_ref', 'TEXT'],
        ['txn_id', 'TEXT'],
        ['payment_method', 'TEXT'],
        ['total_amount', 'REAL']
    ];
    bookingCols.forEach(([col, type]) => {
        db.run(`ALTER TABLE bookings ADD COLUMN ${col} ${type}`, () => {});
    });

    // Reviews table
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            location_id TEXT NOT NULL,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Favorites / Wishlist table
    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            location_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, location_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (location_id) REFERENCES locations(id)
        )
    `);
});

module.exports = db;

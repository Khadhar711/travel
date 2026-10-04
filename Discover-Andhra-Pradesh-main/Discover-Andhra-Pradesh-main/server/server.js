const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const routeRoutes = require('./routes/routeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const staticPath = path.resolve(__dirname, '..');
app.use(express.static(staticPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/routes', routeRoutes);

// Fallback to index.html for unknown non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Discover Andhra Pradesh Server is running!`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📂 Static files served from: ${staticPath}`);
    console.log(`==================================================`);
});

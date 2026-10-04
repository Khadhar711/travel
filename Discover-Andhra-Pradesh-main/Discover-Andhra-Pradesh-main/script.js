document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const locationGrid = document.getElementById('locationGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    const resultsCountBadge = document.getElementById('resultsCountBadge');

    const modal = document.getElementById('locationModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close');
    const userNavSection = document.getElementById('userNavSection');

    // Hero Banner Elements
    const heroExploreBtn = document.getElementById('heroExploreBtn');
    const heroPackagesBtn = document.getElementById('heroPackagesBtn');
    const heroBudgetBtn = document.getElementById('heroBudgetBtn');

    // Theme & Views
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewMapBtn = document.getElementById('viewMapBtn');
    const mapViewContainer = document.getElementById('mapViewContainer');

    // Modals
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingBtn = document.querySelector('.close-booking');
    const bookingForm = document.getElementById('bookingForm');
    const bookingLocationId = document.getElementById('bookingLocationId');
    const bookingLocationName = document.getElementById('bookingLocationName');

    const myBookingsModal = document.getElementById('myBookingsModal');
    const closeMyBookingsBtn = document.querySelector('.close-mybookings');
    const myBookingsList = document.getElementById('myBookingsList');

    const wishlistModal = document.getElementById('wishlistModal');
    const closeWishlistBtn = document.querySelector('.close-wishlist');
    const wishlistContainer = document.getElementById('wishlistContainer');

    const packagesModal = document.getElementById('packagesModal');
    const tourPackagesNavBtn = document.getElementById('tourPackagesNavBtn');
    const closePackagesBtn = document.querySelector('.close-packages');

    const budgetModal = document.getElementById('budgetModal');
    const budgetCalcBtn = document.getElementById('budgetCalcBtn');
    const closeBudgetBtn = document.querySelector('.close-budget');
    const budgetForm = document.getElementById('budgetForm');

    const videoModal = document.getElementById('videoModal');
    const closeVideoBtn = document.querySelector('.close-video');
    const videoIframe = document.getElementById('videoIframe');
    const videoTitle = document.getElementById('videoTitle');

    const toastContainer = document.getElementById('toastContainer');

    let currentFilter = 'all';
    let searchTerm = '';
    let fetchedLocations = [];
    let locationCrowdMap = {};
    let userFavorites = new Set();
    let leafletMap = null;
    let mapMarkers = [];

    // --- 1. Toast Notification System ---
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- 2. Dark / Light Theme System ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
        }
    }

    themeToggleBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
        showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
    });

    // Helper Emojis & URLs
    function getLocationEmoji(type) {
        const emojiMap = {
            district: '🏛️',
            historical: '🏰',
            religious: '🕉️',
            natural: '🌿',
            cultural: '🎭'
        };
        return emojiMap[type] || '🌟';
    }

    function getGoogleMapsUrl(locationName) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName + ', Andhra Pradesh, India')}`;
    }

    function getWikipediaUrl(locationName) {
        return `https://en.wikipedia.org/wiki/${encodeURIComponent(locationName)}`;
    }

    // --- 3. User Navigation & Profile ---
    async function renderUserNav() {
        if (!userNavSection) return;

        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                const roleBadge = user.user_type === 'explorer' ? '🧭 Explorer' : '🎒 Traveller';
                
                await fetchUserFavorites(token);

                userNavSection.innerHTML = `
                    <div class="user-profile-badge">
                        <span class="user-name">👤 ${user.username}</span>
                        <span class="user-role">${roleBadge}</span>
                        <button id="myWishlistBtn" class="nav-action-btn wishlist-btn">❤️ Wishlist (${userFavorites.size})</button>
                        <button id="myBookingsBtn" class="nav-action-btn">📅 Bookings</button>
                        <button id="logoutBtn" class="nav-action-btn logout">🚪 Logout</button>
                    </div>
                `;

                document.getElementById('logoutBtn')?.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userType');
                    showToast('Logged out successfully', 'info');
                    setTimeout(() => window.location.reload(), 500);
                });

                document.getElementById('myBookingsBtn')?.addEventListener('click', openMyBookingsModal);
                document.getElementById('myWishlistBtn')?.addEventListener('click', openWishlistModal);
                return;
            } catch (e) {
                console.error('Error rendering user nav:', e);
            }
        }

        userNavSection.innerHTML = `
            <a href="login.html" class="nav-action-btn login-nav-btn">🔑 Login / Register</a>
        `;
    }

    async function fetchUserFavorites(token) {
        try {
            const res = await fetch('/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                userFavorites = new Set((data.favorites || []).map(f => f.id));
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
        }
    }

    async function toggleFavorite(locationId) {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to save destinations to your wishlist!', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        try {
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ location_id: locationId })
            });

            const data = await res.json();
            if (res.ok) {
                if (data.isFavorite) {
                    userFavorites.add(locationId);
                    showToast(`❤️ Added ${locationId} to Wishlist!`, 'success');
                } else {
                    userFavorites.delete(locationId);
                    showToast(`Removed from Wishlist`, 'info');
                }
                renderUserNav();
                renderLocationCards(fetchedLocations);
            } else {
                showToast(data.error || 'Failed to update wishlist', 'error');
            }
        } catch (err) {
            console.error('Favorite toggle error:', err);
        }
    }

    // --- 4. Fetch Locations, Sorting, & Render ---
    async function loadLocationsFromBackend() {
        try {
            let url = `/api/locations?type=${currentFilter}`;
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                fetchedLocations = data.locations || [];

                // Fetch live crowd telemetries for sorting
                await fetchAllCrowdTelemetry(fetchedLocations);

                applySortingAndRender();
                updateLeafletMapMarkers(fetchedLocations);
                return;
            }
        } catch (err) {
            console.warn('Backend API unreachable, using fallback data:', err);
        }

        if (typeof locations !== 'undefined') {
            fetchedLocations = locations.filter(location => {
                const matchesSearch = location.name.toLowerCase().includes(searchTerm) ||
                                    location.description.toLowerCase().includes(searchTerm);
                const matchesFilter = currentFilter === 'all' || location.type === currentFilter;
                return matchesSearch && matchesFilter;
            });
            applySortingAndRender();
        }
    }

    async function fetchAllCrowdTelemetry(locs) {
        const promises = locs.slice(0, 15).map(async (loc) => {
            const locId = loc.id || loc.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            try {
                const res = await fetch(`/api/crowd/${locId}`);
                if (res.ok) {
                    const data = await res.json();
                    locationCrowdMap[locId] = data.occupancy_percent || 50;
                }
            } catch (e) {}
        });
        await Promise.all(promises);
    }

    function applySortingAndRender() {
        const sortVal = sortSelect ? sortSelect.value : 'name-asc';

        let sorted = [...fetchedLocations];
        if (sortVal === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortVal === 'crowd-low') {
            sorted.sort((a, b) => {
                const idA = a.id || a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const idB = b.id || b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const occA = locationCrowdMap[idA] || 50;
                const occB = locationCrowdMap[idB] || 50;
                return occA - occB; // Low crowd first 🟢
            });
        } else if (sortVal === 'type') {
            sorted.sort((a, b) => a.type.localeCompare(b.type));
        }

        renderLocationCards(sorted);
        if (resultsCountBadge) {
            resultsCountBadge.textContent = `Showing ${sorted.length} of ${fetchedLocations.length} Destinations`;
        }
    }

    sortSelect?.addEventListener('change', applySortingAndRender);

    function createLocationCard(location) {
        const locId = location.id || location.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isFav = userFavorites.has(locId);

        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <div class="card-image-wrapper" style="position: relative;">
                <img src="${location.imageUrl}" alt="${location.name}" class="card-image" onerror="this.src='https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=600&q=80'">
                <button class="fav-heart-btn ${isFav ? 'active' : ''}" data-id="${locId}" title="${isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${getLocationEmoji(location.type)} ${location.name}</h3>
                
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0;">
                    <span class="card-type">${getLocationEmoji(location.type)} ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</span>
                    ${location.district ? `<span class="card-type">🏛️ ${location.district}</span>` : ''}
                    <span class="weather-pill" data-id="${locId}">🌤️ ${location.temp_c || 26}°C</span>
                </div>

                <p class="card-description">${location.description}</p>
                
                <div class="card-actions">
                    <button class="action-btn learn-more view-modal-btn">
                        📚 Details
                    </button>
                    <button class="action-btn book-now book-trigger-btn">
                        🏨 Book Now
                    </button>
                </div>
            </div>
        `;
        
        // Favorite toggle event
        const heartBtn = card.querySelector('.fav-heart-btn');
        heartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(locId);
        });

        // Detail Modal event
        const viewModalBtn = card.querySelector('.view-modal-btn');
        viewModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showModal(location);
        });

        const cardContent = card.querySelector('.card-content');
        cardContent.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                showModal(location);
            }
        });

        // Book Now event
        const bookBtn = card.querySelector('.book-trigger-btn');
        bookBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openBookingModal(locId, location.name);
        });
        
        return card;
    }

    async function showModal(location) {
        const locId = location.id || location.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isFav = userFavorites.has(locId);
        
        modalContent.innerHTML = `
            <div style="position: relative;">
                <img src="${location.imageUrl}" alt="${location.name}" class="modal-image" onerror="this.src='https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=600&q=80'">
                <button id="modalFavBtn" class="fav-heart-btn ${isFav ? 'active' : ''}" style="top: 15px; right: 15px; width: 42px; height: 42px; font-size: 1.4rem;">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <h2 class="card-title" style="margin-top: 10px;">${getLocationEmoji(location.type)} ${location.name}</h2>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0;">
                <span class="card-type">${getLocationEmoji(location.type)} ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</span>
                ${location.district ? `<span class="card-type">🏛️ ${location.district}</span>` : ''}
            </div>

            <p class="card-description" style="margin-top:10px; font-size:1.05rem;">${location.description}</p>
            
            <!-- Weather & Travel Season Info -->
            <div id="modalWeatherBox" style="margin-top: 15px; background: #e8f0fe; padding: 12px; border-radius: 8px; border-left: 4px solid #1a73e8; font-size: 0.9rem;">
                ⏳ Loading weather forecast & travel advice...
            </div>

            <!-- Live Crowd Telemetry Info -->
            <div id="modalCrowdBox" style="margin-top: 10px; background: #fff5f5; padding: 12px; border-radius: 8px; border-left: 4px solid #ff4d4d; font-size: 0.9rem;">
                ⏳ Loading live crowd telemetry...
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <a href="${getGoogleMapsUrl(location.name)}" target="_blank" class="action-btn location">
                    📍 Google Maps
                </a>
                <button id="launchVideoBtn" class="action-btn learn-more">
                    🎥 Virtual Video Tour
                </button>
                <button class="action-btn book-now modal-book-btn">
                    🏨 Book Tour / Hotel
                </button>
            </div>

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">

            <!-- Reviews Section -->
            <div class="reviews-section">
                <h3>💬 Visitor Reviews & Ratings</h3>
                <div id="reviewsContainer" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                    <p style="color: #888;">Loading reviews...</p>
                </div>

                <div id="addReviewFormContainer" style="margin-top: 15px; background: #f8f9fa; padding: 12px; border-radius: 8px;">
                    <h4 style="margin-bottom: 8px;">Leave a Review</h4>
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 0.9rem;">Rating:</label>
                        <select id="reviewRating" style="padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
                            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                            <option value="4">⭐⭐⭐⭐ (4/5)</option>
                            <option value="3">⭐⭐⭐ (3/5)</option>
                            <option value="2">⭐⭐ (2/5)</option>
                            <option value="1">⭐ (1/5)</option>
                        </select>
                    </div>
                    <textarea id="reviewComment" placeholder="Share your experience visiting this place..." style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc;" rows="2"></textarea>
                    <button id="submitReviewBtn" class="action-btn book-now" style="margin-top: 8px; border: none; cursor: pointer;">Post Review</button>
                </div>
            </div>
        `;

        modalContent.querySelector('#modalFavBtn')?.addEventListener('click', () => toggleFavorite(locId));

        modalContent.querySelector('.modal-book-btn')?.addEventListener('click', () => {
            modal.style.display = 'none';
            openBookingModal(locId, location.name);
        });

        modalContent.querySelector('#launchVideoBtn')?.addEventListener('click', () => {
            openVideoModal(location.name, location.video_id || 'x3u8C1_G1p8');
        });

        modalContent.querySelector('#submitReviewBtn')?.addEventListener('click', () => {
            submitReview(locId);
        });

        modal.style.display = 'block';
        fetchWeather(locId);
        fetchCrowd(locId);
        fetchReviews(locId);
    }

    async function fetchWeather(locationId) {
        const weatherBox = document.getElementById('modalWeatherBox');
        if (!weatherBox) return;

        try {
            const res = await fetch(`/api/weather/${locationId}`);
            if (res.ok) {
                const data = await res.json();
                weatherBox.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #1a73e8;">
                        <span>${data.icon} Current Weather: ${data.temp_c}°C / ${data.temp_f}°F</span>
                        <span style="font-weight: 500; background: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${data.condition}</span>
                    </div>
                    <div style="margin-top: 6px; color: #444; font-size: 0.85rem;">
                        🗓️ <strong>Best Time to Visit:</strong> ${data.best_time}<br>
                        💧 <strong>Average Humidity:</strong> ${data.humidity}
                    </div>
                `;
                return;
            }
        } catch (e) {
            console.error('Weather fetch error:', e);
        }
        weatherBox.innerHTML = `🌤️ Weather: 26°C | 🗓️ Best Time: October to March`;
    }

    async function fetchCrowd(locationId) {
        const crowdBox = document.getElementById('modalCrowdBox');
        if (!crowdBox) return;

        try {
            const res = await fetch(`/api/crowd/${locationId}`);
            if (res.ok) {
                const data = await res.json();
                crowdBox.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: ${data.status_color};">
                        <span>🔴 Live Crowd: ${data.crowd_level} (${data.occupancy_percent}% Occupancy)</span>
                        <span style="font-weight: 500; background: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; border: 1px solid ${data.status_color};">${data.live_trend}</span>
                    </div>
                    <div style="margin-top: 6px; color: #444; font-size: 0.85rem; line-height: 1.5;">
                        ⏳ <strong>Est. Queue Wait:</strong> ${data.estimated_wait_time}<br>
                        🕒 <strong>Peak Hours:</strong> ${data.peak_hours}
                    </div>
                    <a href="${data.map_url}" class="action-btn" style="display: inline-block; margin-top: 8px; background: #ff4d4d; color: white; font-size: 0.8rem; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        🗺️ Open Live Crowd Map & Monitor
                    </a>
                `;
                return;
            }
        } catch (e) {
            console.error('Crowd fetch error:', e);
        }
        crowdBox.innerHTML = `🔴 Live Crowd: Moderate 🟡 | ⏳ Est. Wait: 20 mins`;
    }

    async function fetchReviews(locationId) {
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (!reviewsContainer) return;

        try {
            const res = await fetch(`/api/reviews/${locationId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.reviews && data.reviews.length > 0) {
                    reviewsContainer.innerHTML = data.reviews.map(r => `
                        <div style="background: #fff; border-bottom: 1px solid #eee; padding: 8px 0; margin-bottom: 6px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
                                <span>👤 ${r.username}</span>
                                <span>${'⭐'.repeat(r.rating)}</span>
                            </div>
                            <p style="font-size: 0.9rem; margin-top: 4px; color: #444;">${r.comment}</p>
                        </div>
                    `).join('');
                } else {
                    reviewsContainer.innerHTML = '<p style="color: #888; font-size: 0.9rem;">No reviews yet. Be the first to write a review!</p>';
                }
                return;
            }
        } catch (e) {
            console.error('Error loading reviews:', e);
        }
        reviewsContainer.innerHTML = '<p style="color: #888; font-size: 0.9rem;">Log in to view & post reviews!</p>';
    }

    async function submitReview(locationId) {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to post a review.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value.trim();

        if (!comment) {
            showToast('Please write a review comment.', 'warning');
            return;
        }

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ location_id: locationId, rating, comment })
            });

            if (res.ok) {
                showToast('Review posted successfully! ⭐', 'success');
                document.getElementById('reviewComment').value = '';
                fetchReviews(locationId);
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to post review', 'error');
            }
        } catch (err) {
            console.error('Error posting review:', err);
        }
    }

    // --- 5. Leaflet Interactive Map View ---
    function initLeafletMap() {
        if (leafletMap || typeof L === 'undefined') return;

        leafletMap = L.map('mapViewContainer').setView([15.9129, 79.7400], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);
    }

    function updateLeafletMapMarkers(locs) {
        if (!leafletMap) initLeafletMap();
        if (!leafletMap) return;

        mapMarkers.forEach(m => leafletMap.removeLayer(m));
        mapMarkers = [];

        locs.forEach(loc => {
            const lat = loc.latitude || 16.0;
            const lng = loc.longitude || 80.0;

            const marker = L.marker([lat, lng]).addTo(leafletMap);
            const locId = loc.id || loc.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            const popupContent = `
                <div style="text-align: center; max-width: 200px;">
                    <img src="${loc.imageUrl}" alt="${loc.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=300&q=80'">
                    <h4 style="margin: 6px 0 2px; color: #1a73e8;">${getLocationEmoji(loc.type)} ${loc.name}</h4>
                    <p style="font-size: 0.75rem; color: #666; margin-bottom: 8px;">${loc.type.toUpperCase()} • ${loc.district || ''}</p>
                    <button class="action-btn book-now map-popup-btn" data-id="${locId}" style="padding: 4px 10px; font-size: 0.75rem; width: 100%;">View Place</button>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('popupopen', (e) => {
                const px = e.popup._container.querySelector('.map-popup-btn');
                px?.addEventListener('click', () => showModal(loc));
            });

            mapMarkers.push(marker);
        });
    }

    viewGridBtn?.addEventListener('click', () => {
        viewGridBtn.classList.add('active');
        viewMapBtn.classList.remove('active');
        locationGrid.style.display = 'grid';
        mapViewContainer.style.display = 'none';
    });

    viewMapBtn?.addEventListener('click', () => {
        viewMapBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        locationGrid.style.display = 'none';
        mapViewContainer.style.display = 'block';

        if (!leafletMap) initLeafletMap();
        setTimeout(() => {
            leafletMap?.invalidateSize();
            updateLeafletMapMarkers(fetchedLocations);
        }, 100);
    });

    // --- 6. Hero Banner Action Listeners ---
    heroExploreBtn?.addEventListener('click', () => {
        viewMapBtn?.click();
        mapViewContainer?.scrollIntoView({ behavior: 'smooth' });
    });

    heroPackagesBtn?.addEventListener('click', () => {
        if (packagesModal) packagesModal.style.display = 'block';
    });

    heroBudgetBtn?.addEventListener('click', () => {
        if (budgetModal) budgetModal.style.display = 'block';
    });

    tourPackagesNavBtn?.addEventListener('click', () => {
        if (packagesModal) packagesModal.style.display = 'block';
    });

    closePackagesBtn?.addEventListener('click', () => {
        if (packagesModal) packagesModal.style.display = 'none';
    });

    document.querySelectorAll('.package-book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkgName = btn.getAttribute('data-name');
            if (packagesModal) packagesModal.style.display = 'none';
            openBookingModal('package', pkgName);
        });
    });

    // --- 7. Virtual Video Preview Modal ---
    function openVideoModal(title, videoId) {
        if (!videoModal || !videoIframe) return;
        videoTitle.textContent = `🎥 Virtual Tour: ${title}`;
        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.style.display = 'block';
    }

    closeVideoBtn?.addEventListener('click', () => {
        videoModal.style.display = 'none';
        if (videoIframe) videoIframe.src = '';
    });

    // --- 8. Tour Budget Calculator ---
    budgetCalcBtn?.addEventListener('click', () => {
        budgetModal.style.display = 'block';
    });

    closeBudgetBtn?.addEventListener('click', () => {
        budgetModal.style.display = 'none';
    });

    budgetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const days = document.getElementById('budgetDays').value;
        const guests = document.getElementById('budgetGuests').value;
        const style = document.getElementById('budgetStyle').value;
        const transport = document.getElementById('budgetTransport').value;

        try {
            const res = await fetch('/api/budget/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days, guests, style, transport })
            });

            const data = await res.json();
            if (res.ok) {
                document.getElementById('totalCostSpan').textContent = `₹${data.totalEstimateINR.toLocaleString()}`;
                document.getElementById('perPersonSpan').textContent = `₹${data.perPersonINR.toLocaleString()}`;
                document.getElementById('stayCostSpan').textContent = `₹${data.breakdown.accommodation.toLocaleString()}`;
                document.getElementById('foodCostSpan').textContent = `₹${data.breakdown.food_and_dining.toLocaleString()}`;
                document.getElementById('transportCostSpan').textContent = `₹${data.breakdown.transportation.toLocaleString()}`;
                document.getElementById('ticketCostSpan').textContent = `₹${data.breakdown.sightseeing_and_tickets.toLocaleString()}`;

                document.getElementById('budgetResult').style.display = 'block';
                showToast('Budget calculation updated!', 'success');
            }
        } catch (err) {
            console.error('Budget calculation error:', err);
            showToast('Failed to calculate budget', 'error');
        }
    });

    // Wishlist Modal
    async function openWishlistModal() {
        const token = localStorage.getItem('token');
        if (!token) return;

        wishlistContainer.innerHTML = '<p style="color: #888;">Loading your saved wishlist...</p>';
        wishlistModal.style.display = 'block';

        try {
            const res = await fetch('/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.favorites && data.favorites.length > 0) {
                    wishlistContainer.innerHTML = '';
                    data.favorites.forEach(fav => {
                        wishlistContainer.appendChild(createLocationCard(fav));
                    });
                } else {
                    wishlistContainer.innerHTML = '<p style="color: #888;">Your wishlist is empty. Click the heart ❤️ on any destination to save it here!</p>';
                }
            }
        } catch (err) {
            console.error('Wishlist fetch error:', err);
        }
    }

    closeWishlistBtn?.addEventListener('click', () => {
        wishlistModal.style.display = 'none';
    });

    // Booking Modals
    function openBookingModal(locId, locName) {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to make a booking reservation.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        bookingLocationId.value = locId;
        bookingLocationName.value = locName;
        document.getElementById('bookingModalTitle').textContent = `📅 Reserve Tour / Hotel for ${locName}`;
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('bookingDate').value = tomorrow.toISOString().split('T')[0];

        bookingModal.style.display = 'block';
    }

    // --- Booking Checkout & Payment State ---
    let pendingBooking = null;
    let selectedPaymentMethod = 'UPI (Google Pay)';

    const paymentModal = document.getElementById('paymentModal');
    const closePaymentBtn = document.querySelector('.close-payment');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    const ticketModal = document.getElementById('ticketModal');
    const closeTicketBtn = document.querySelector('.close-ticket');
    const closeTicketBottomBtn = document.getElementById('closeTicketBottomBtn');
    const printTicketBtn = document.getElementById('printTicketBtn');

    // Payment Tabs Switcher
    document.querySelectorAll('.pay-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pay-tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '#cbd5e1';
                b.style.background = 'transparent';
                b.style.color = '#334155';
            });
            btn.classList.add('active');
            btn.style.borderColor = '#1a73e8';
            btn.style.background = '#e8f0fe';
            btn.style.color = '#1a73e8';

            const method = btn.getAttribute('data-method');
            document.getElementById('payUpiView').style.display = method === 'upi' ? 'block' : 'none';
            document.getElementById('payCardView').style.display = method === 'card' ? 'block' : 'none';
            document.getElementById('payCounterView').style.display = method === 'counter' ? 'block' : 'none';

            selectedPaymentMethod = method === 'upi' ? 'UPI (Google Pay / PhonePe)' : method === 'card' ? 'Credit / Debit Card' : 'Pay at Counter on Arrival';
        });
    });

    closePaymentBtn?.addEventListener('click', () => {
        if (paymentModal) paymentModal.style.display = 'none';
    });

    closeTicketBtn?.addEventListener('click', () => {
        if (ticketModal) ticketModal.style.display = 'none';
    });

    closeTicketBottomBtn?.addEventListener('click', () => {
        if (ticketModal) ticketModal.style.display = 'none';
    });

    printTicketBtn?.addEventListener('click', () => {
        window.print();
    });

    function showTicket(booking) {
        document.getElementById('tktRef').textContent = booking.booking_ref || `APTDC-${new Date().getFullYear()}-${booking.id || 9842}`;
        document.getElementById('tktTxn').textContent = booking.txn_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        document.getElementById('tktDest').textContent = booking.location_name;
        document.getElementById('tktDate').textContent = booking.travel_date;
        document.getElementById('tktGuests').textContent = `${booking.guests || 1} ${booking.guests > 1 ? 'Guests' : 'Guest'}`;
        document.getElementById('tktPhone').textContent = booking.contact_phone || 'Verified on file';
        document.getElementById('tktPayMethod').textContent = `Paid via ${booking.payment_method || 'UPI (Google Pay)'}`;
        document.getElementById('tktTotal').textContent = `₹${(booking.total_amount || 2625).toLocaleString()}`;
        
        const qrImg = document.getElementById('tktQrImg');
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent((booking.booking_ref || 'APTDC') + '-' + booking.location_name)}`;
        }

        if (ticketModal) ticketModal.style.display = 'block';
    }

    bookingForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to book your tour reservation.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        const location_id = bookingLocationId.value;
        const location_name = bookingLocationName.value;
        const travel_date = document.getElementById('bookingDate').value;
        const guests = parseInt(document.getElementById('bookingGuests').value, 10) || 1;
        const contact_phone = document.getElementById('bookingPhone').value;
        const notes = document.getElementById('bookingNotes').value;

        const baseFare = guests * 1250;
        const gst = Math.round(baseFare * 0.05);
        const totalAmount = baseFare + gst;

        pendingBooking = {
            location_id,
            location_name,
            travel_date,
            guests,
            contact_phone,
            notes,
            total_amount: totalAmount
        };

        // Populate Checkout View
        document.getElementById('payDestName').textContent = location_name;
        document.getElementById('payTravelDate').textContent = travel_date;
        document.getElementById('payGuests').textContent = `${guests} ${guests > 1 ? 'Guests' : 'Guest'}`;
        document.getElementById('payBaseFare').textContent = `₹${baseFare.toLocaleString()}`;
        document.getElementById('payGst').textContent = `₹${gst.toLocaleString()}`;
        document.getElementById('payTotalAmount').textContent = `₹${totalAmount.toLocaleString()}`;
        document.getElementById('payBtnAmount').textContent = `₹${totalAmount.toLocaleString()}`;

        // Switch from booking modal to checkout
        bookingModal.style.display = 'none';
        if (paymentModal) paymentModal.style.display = 'block';
    });

    confirmPaymentBtn?.addEventListener('click', async () => {
        if (!pendingBooking) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.innerHTML = '<span>⏳ Authorizing Payment...</span>';

        const generatedTxnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

        setTimeout(async () => {
            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...pendingBooking,
                        payment_method: selectedPaymentMethod,
                        txn_id: generatedTxnId,
                        total_amount: pendingBooking.total_amount
                    })
                });

                const data = await res.json();
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.innerHTML = `<span>🔒 Complete Payment (<span id="payBtnAmount">₹${pendingBooking.total_amount.toLocaleString()}</span>)</span>`;

                if (res.ok) {
                    if (paymentModal) paymentModal.style.display = 'none';
                    bookingForm.reset();
                    showToast('🎉 Payment Successful! Your Travel Voucher is ready.', 'success');
                    showTicket(data.booking);
                } else {
                    showToast(data.error || 'Payment failed', 'error');
                }
            } catch (err) {
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.innerHTML = `<span>🔒 Complete Payment</span>`;
                console.error('Payment booking error:', err);
                showToast('Server error during payment.', 'error');
            }
        }, 1200);
    });

    async function openMyBookingsModal() {
        const token = localStorage.getItem('token');
        if (!token) return;

        myBookingsList.innerHTML = '<p style="color: #888;">Loading your bookings...</p>';
        myBookingsModal.style.display = 'block';

        try {
            const res = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.bookings && data.bookings.length > 0) {
                    myBookingsList.innerHTML = data.bookings.map(b => `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1a73e8; padding: 14px; margin-bottom: 12px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem; color: #1a73e8;">
                                <span>📍 ${b.location_name}</span>
                                <span style="text-transform: capitalize; background: #e8f0fe; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${b.status}</span>
                            </div>
                            <div style="margin-top: 6px; font-size: 0.85rem; color: #555;">
                                📅 <strong>Travel Date:</strong> ${b.travel_date} | 👥 <strong>Guests:</strong> ${b.guests}
                            </div>
                            <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                                🎟️ <strong>Ref:</strong> ${b.booking_ref || 'APTDC-2026'} | 💳 <strong>Method:</strong> ${b.payment_method || 'UPI'} | <strong>Total:</strong> ₹${(b.total_amount || 2625).toLocaleString()}
                            </div>
                            <button class="action-btn book-now view-tkt-btn" data-booking='${JSON.stringify(b).replace(/'/g, "&apos;")}' style="margin-top: 8px; padding: 6px 12px; font-size: 0.8rem; width: auto;">
                                🎟️ View / Print E-Voucher
                            </button>
                        </div>
                    `).join('');

                    document.querySelectorAll('.view-tkt-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const bData = JSON.parse(btn.getAttribute('data-booking'));
                            if (myBookingsModal) myBookingsModal.style.display = 'none';
                            showTicket(bData);
                        });
                    });
                } else {
                    myBookingsList.innerHTML = '<p style="color: #888;">No tour or hotel bookings found yet.</p>';
                }
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    }

    function renderLocationCards(locationsToRender) {
        locationGrid.innerHTML = '';
        if (locationsToRender.length === 0) {
            locationGrid.innerHTML = '<p class="no-results">❌ No destinations found matching your criteria.</p>';
            return;
        }

        locationsToRender.forEach(loc => {
            locationGrid.appendChild(createLocationCard(loc));
        });
    }

    searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        loadLocationsFromBackend();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadLocationsFromBackend();
        });
    });

    // --- 9. Bilingual Language Switcher (English ⇄ Telugu) ---
    const langToggleBtn = document.getElementById('langToggleBtn');
    let currentLang = localStorage.getItem('language') || 'en';

    const translations = {
        te: {
            langBtn: 'English',
            siteTitle: 'ఆంధ్రప్రదేశ్ దర్శనం',
            siteTagline: 'మీ సంపూర్ణ పర్యాటక మార్గదర్శి',
            districts: 'జిల్లాలు',
            historical: 'చారిత్రక',
            religious: 'ఆధ్యాత్మిక',
            natural: 'ప్రకృతి',
            cultural: 'సంస్కృతి',
            heroSubtitle: '✨ ఆంధ్రప్రదేశ్ అధికారిక పర్యాటక పోర్టల్',
            heroTitle: 'ఆంధ్రప్రదేశ్ వైభవాన్ని అన్వేషించండి 🌄',
            heroDesc: 'నిర్మలమైన బీచ్‌లు, పురాతన ఆలయాలు, గ్రాండ్ కాన్యన్స్ మరియు కొండ ప్రాంతాలను ప్రత్యక్ష రద్దీ సమాచారంతో అన్వేషించండి.',
            statDest: '🏛️ <strong>36+</strong> గమ్యస్థానాలు',
            statDist: '📍 <strong>13</strong> జిల్లాలు',
            statCrowd: '🔴 <strong>24/7</strong> ప్రత్యక్ష రద్దీ మానిటర్',
            statRating: '⭐ <strong>4.9/5</strong> పర్యాటకుల రేటింగ్',
            btnExplore: '🗺️ ప్రత్యక్ష మ్యాప్',
            btnItin: '🤖 AI ట్రిప్ ప్లానర్',
            btnFood: '🍛 ఆంధ్ర వంటకాలు',
            btnPackages: '📦 టూర్ ప్యాకేజీలు',
            btnBudget: '💰 బడ్జెట్ లెక్కింపు',
            filterAll: 'అన్నీ',
            filterDist: 'జిల్లాలు',
            filterHist: 'చారిత్రక',
            filterRel: 'ఆధ్యాత్మిక',
            filterNat: 'ప్రకృతి',
            filterCult: 'సంస్కృతి',
            searchPlaceholder: '🔍 ప్రదేశాలు, జిల్లాలు లేదా ముఖ్య పదాలను శోధించండి...'
        },
        en: {
            langBtn: 'తెలుగు',
            siteTitle: 'Discover Andhra Pradesh',
            siteTagline: 'Your Complete Tourism Guide',
            districts: 'Districts',
            historical: 'Historical',
            religious: 'Religious',
            natural: 'Natural',
            cultural: 'Cultural',
            heroSubtitle: '✨ Official Andhra Pradesh Travel Portal',
            heroTitle: 'Discover the Soul of Andhra Pradesh 🌄',
            heroDesc: 'Explore pristine beaches, ancient temples, grand canyons, & misty hill stations with real-time crowd telemetry.',
            statDest: '🏛️ <strong>36+</strong> Destinations',
            statDist: '📍 <strong>13</strong> Districts',
            statCrowd: '🔴 <strong>24/7</strong> Live Crowd Monitor',
            statRating: '⭐ <strong>4.9/5</strong> Traveler Rating',
            btnExplore: '🗺️ Explore Live Map',
            btnItin: '🤖 Plan Trip with AI',
            btnFood: '🍛 Andhra Food Trail',
            btnPackages: '📦 View Tour Packages',
            btnBudget: '💰 Calculate Tour Budget',
            filterAll: 'All',
            filterDist: 'Districts',
            filterHist: 'Historical',
            filterRel: 'Religious',
            filterNat: 'Natural',
            filterCult: 'Cultural',
            searchPlaceholder: '🔍 Search destinations, districts, or keywords...'
        }
    };

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        const t = translations[lang];

        if (langToggleBtn) langToggleBtn.textContent = t.langBtn;

        const siteTitleH1 = document.querySelector('.site-title h1');
        if (siteTitleH1) siteTitleH1.textContent = t.siteTitle;
        const siteTitleP = document.querySelector('.site-title p');
        if (siteTitleP) siteTitleP.textContent = t.siteTagline;

        // Nav items
        const navLinks = document.querySelectorAll('.nav-item > a');
        if (navLinks.length >= 5) {
            navLinks[0].textContent = t.districts;
            navLinks[1].textContent = t.historical;
            navLinks[2].textContent = t.religious;
            navLinks[3].textContent = t.natural;
            navLinks[4].textContent = t.cultural;
        }

        // Hero
        const heroSub = document.getElementById('heroSubtitleText');
        if (heroSub) heroSub.textContent = t.heroSubtitle;
        const heroTitle = document.getElementById('heroTitleText');
        if (heroTitle) heroTitle.textContent = t.heroTitle;
        const heroDesc = document.getElementById('heroDescText');
        if (heroDesc) heroDesc.textContent = t.heroDesc;

        // Stats
        const statDestEl = document.getElementById('statDest');
        if (statDestEl) statDestEl.innerHTML = t.statDest;
        const statDistEl = document.getElementById('statDist');
        if (statDistEl) statDistEl.innerHTML = t.statDist;
        const statCrowdEl = document.getElementById('statCrowd');
        if (statCrowdEl) statCrowdEl.innerHTML = t.statCrowd;
        const statRatingEl = document.getElementById('statRating');
        if (statRatingEl) statRatingEl.innerHTML = t.statRating;

        // Hero buttons
        const heroExplore = document.getElementById('heroExploreBtn');
        if (heroExplore) heroExplore.textContent = t.btnExplore;
        const heroItin = document.getElementById('heroItinBtn');
        if (heroItin) heroItin.textContent = t.btnItin;
        const heroFood = document.getElementById('heroFoodBtn');
        if (heroFood) heroFood.textContent = t.btnFood;
        const heroPackages = document.getElementById('heroPackagesBtn');
        if (heroPackages) heroPackages.textContent = t.btnPackages;
        const heroBudget = document.getElementById('heroBudgetBtn');
        if (heroBudget) heroBudget.textContent = t.btnBudget;

        // Filters
        filterButtons.forEach(btn => {
            const f = btn.dataset.filter;
            if (f === 'all') btn.textContent = t.filterAll;
            if (f === 'district') btn.textContent = t.filterDist;
            if (f === 'historical') btn.textContent = t.filterHist;
            if (f === 'religious') btn.textContent = t.filterRel;
            if (f === 'natural') btn.textContent = t.filterNat;
            if (f === 'cultural') btn.textContent = t.filterCult;
        });

        if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    }

    langToggleBtn?.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'te' : 'en';
        applyLanguage(nextLang);
        showToast(nextLang === 'te' ? 'భాషను తెలుగులోకి మార్చారు!' : 'Switched to English!', 'info');
    });

    // --- 10. AI Itinerary Planner Logic ---
    const itineraryModal = document.getElementById('itineraryModal');
    const itineraryNavBtn = document.getElementById('itineraryNavBtn');
    const heroItinBtn = document.getElementById('heroItinBtn');
    const closeItineraryBtn = document.querySelector('.close-itinerary');
    const itineraryForm = document.getElementById('itineraryForm');
    const itineraryResult = document.getElementById('itineraryResult');
    const itinDaysContainer = document.getElementById('itinDaysContainer');
    const printItinBtn = document.getElementById('printItinBtn');

    function openItineraryModal() {
        if (itineraryModal) itineraryModal.style.display = 'block';
    }

    itineraryNavBtn?.addEventListener('click', openItineraryModal);
    heroItinBtn?.addEventListener('click', openItineraryModal);
    closeItineraryBtn?.addEventListener('click', () => {
        if (itineraryModal) itineraryModal.style.display = 'none';
    });

    itineraryForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const destination = document.getElementById('itinDest').value;
        const days = document.getElementById('itinDays').value;
        const style = document.getElementById('itinStyle').value;
        const pace = document.getElementById('itinPace').value;

        showToast('Generating personalized schedule...', 'info');

        try {
            const res = await fetch('/api/itinerary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination, days, style, pace })
            });

            if (res.ok) {
                const data = await res.json();
                document.getElementById('itinResTitle').textContent = data.destination;
                document.getElementById('itinResMeta').textContent = `${data.totalDays} Days • ${data.style.toUpperCase()} • Est. ₹${data.estimatedCostINR.toLocaleString()}/person`;

                itinDaysContainer.innerHTML = data.dayPlans.map(dp => `
                    <div class="timeline-card">
                        <h4 style="color: #1a73e8; margin-bottom: 10px; font-size: 1rem;">📅 ${dp.title}</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${dp.activities.map(act => `
                                <div class="timeline-step">
                                    <div class="step-icon">${act.icon}</div>
                                    <div class="step-content">
                                        <span class="step-time">${act.time}</span>
                                        <h4>${act.title}</h4>
                                        <p class="step-desc">${act.desc}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');

                const tipsList = document.getElementById('itinTipsList');
                if (tipsList) {
                    tipsList.innerHTML = data.travelTips.map(t => `<li>${t}</li>`).join('');
                }

                itineraryResult.style.display = 'block';
                showToast('AI Itinerary Ready!', 'success');
            } else {
                showToast('Failed to generate itinerary.', 'error');
            }
        } catch (err) {
            console.error('Itinerary error:', err);
            showToast('Connection error while generating itinerary.', 'error');
        }
    });

    printItinBtn?.addEventListener('click', () => {
        window.print();
    });

    // --- 11. Inter-City Route & Distance Matrix Logic ---
    const routeFinderModal = document.getElementById('routeFinderModal');
    const routesNavBtn = document.getElementById('routesNavBtn');
    const closeRoutesBtn = document.querySelector('.close-routes');
    const routeFinderForm = document.getElementById('routeFinderForm');
    const routeResult = document.getElementById('routeResult');

    function openRoutesModal() {
        if (routeFinderModal) routeFinderModal.style.display = 'block';
    }

    routesNavBtn?.addEventListener('click', openRoutesModal);
    closeRoutesBtn?.addEventListener('click', () => {
        if (routeFinderModal) routeFinderModal.style.display = 'none';
    });

    routeFinderForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origin = document.getElementById('routeOrigin').value;
        const destination = document.getElementById('routeDest').value;

        try {
            const res = await fetch('/api/routes/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination })
            });

            if (res.ok) {
                const data = await res.json();
                document.getElementById('routeTitle').textContent = `🚗 ${data.origin} ➔ ${data.destination}`;
                document.getElementById('routeDistBadge').textContent = `${data.distanceKm} KM`;
                document.getElementById('routeDrivingTime').textContent = data.drivingTime;
                document.getElementById('routeHighway').textContent = data.highwayRoute;
                document.getElementById('routeTrains').textContent = data.trainOptions;
                document.getElementById('routeFlight').textContent = data.flightOptions;
                document.getElementById('routeBusFare').textContent = data.estimatedBusFare;
                document.getElementById('routeCabFare').textContent = data.estimatedCabFare;

                routeResult.style.display = 'block';
                showToast('Route details calculated!', 'success');
            }
        } catch (err) {
            console.error('Route error:', err);
            showToast('Failed to fetch route information.', 'error');
        }
    });

    // --- 12. Andhra Food Trail & Cuisine Guide ---
    const foodTrailModal = document.getElementById('foodTrailModal');
    const foodTrailNavBtn = document.getElementById('foodTrailNavBtn');
    const heroFoodBtn = document.getElementById('heroFoodBtn');
    const closeFoodBtn = document.querySelector('.close-food');
    const foodGrid = document.getElementById('foodGrid');
    const foodFilterBtns = document.querySelectorAll('.food-filter-btn');

    const foodDelicacies = [
        {
            name: "Atreyapuram Pootharekulu",
            district: "East Godavari",
            type: "sweet",
            icon: "🍯",
            badge: "Sweet / GI Tag",
            desc: "Delicate paper-thin wafer sweet made from rice starch, dry fruits, and pure ghee. A geographical indication (GI) protected delicacy.",
            eatery: "Sri Venkata Satyanarayana Sweets, Atreyapuram"
        },
        {
            name: "Tirupati Srivari Laddu",
            district: "Tirumala, Tirupati",
            type: "sweet",
            icon: "🪔",
            badge: "Sweet / Sacred Prasadam",
            desc: "Globally celebrated holy offering crafted with gram flour, cashew nuts, raisins, pure ghee, and cardamom at Tirumala temple.",
            eatery: "TTD Prasadam Complex, Tirumala"
        },
        {
            name: "Araku Bamboo Chicken (Bongu Lo Kodi)",
            district: "Alluri Sitharama Raju / Visakhapatnam",
            type: "nonveg",
            icon: "🍗",
            badge: "Non-Veg Tribal Specialty",
            desc: "Tender chicken marinated in wild indigenous herbs and slow-roasted inside fresh bamboo shoots without water or oil.",
            eatery: "Tribal Roadside Stalls, Borra & Chaparai"
        },
        {
            name: "Kakinada Gottam Kaja",
            district: "Kakinada",
            type: "sweet",
            icon: "🍩",
            badge: "Sweet Specialty",
            desc: "Cylindrical golden sweet pastry with a crispy outer shell and a rich, hot sugary syrup filling inside.",
            eatery: "Kotaiah Sweets, Kakinada (Since 1891)"
        },
        {
            name: "Rayalaseema Ragi Sankati & Natukodi",
            district: "Rayalaseema Region",
            type: "nonveg",
            icon: "🍲",
            badge: "Non-Veg Royal Dish",
            desc: "Wholesome finger millet mudda served with spicy, aromatic country chicken curry and lots of ghee.",
            eatery: "Mourya Inn Restaurant, Kurnool"
        },
        {
            name: "Gongura Pachadi with Steaming Rice",
            district: "Guntur & Krishna",
            type: "veg",
            icon: "🥬",
            badge: "Vegetarian Icon",
            desc: "The quintessential soul food of Andhra: tangy sorrel leaves ground with red chillies, garlic, and served with hot ghee.",
            eatery: "Hotel Subani, Guntur"
        },
        {
            name: "Bhimavaram Royyala Iguru (Prawn Fry)",
            district: "West Godavari",
            type: "nonveg",
            icon: "🦐",
            badge: "Non-Veg Coastal Seafood",
            desc: "Fresh river prawns stir-fried in rich shallot, coconut, and fiery coastal Andhra garam masala gravy.",
            eatery: "Godavari Ruchulu, Bhimavaram"
        },
        {
            name: "Madugula Halwa",
            district: "Anakapalli",
            type: "sweet",
            icon: "🍮",
            badge: "Sweet Heritage",
            desc: "Centuries-old recipe made from fermented wheat milk, pure cow ghee, and cashew nuts.",
            eatery: "Dangeti Murty Halwa, Madugula"
        }
    ];

    function renderFoodItems(filter = 'all') {
        if (!foodGrid) return;
        const items = filter === 'all' ? foodDelicacies : foodDelicacies.filter(f => f.type === filter);
        foodGrid.innerHTML = items.map(f => `
            <div class="food-card">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4 style="color: var(--text-color); font-size: 1rem;">${f.icon} ${f.name}</h4>
                        <span class="food-badge ${f.type}">${f.badge}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #1a73e8; font-weight: 600; margin: 4px 0;">📍 ${f.district}</p>
                    <p style="font-size: 0.85rem; color: #64748b; line-height: 1.4; margin-top: 6px;">${f.desc}</p>
                </div>
                <div style="margin-top: 10px; font-size: 0.75rem; background: rgba(0,0,0,0.04); padding: 6px 10px; border-radius: 6px;">
                    ⭐ <strong>Iconic Spot:</strong> ${f.eatery}
                </div>
            </div>
        `).join('');
    }

    function openFoodModal() {
        if (foodTrailModal) {
            renderFoodItems('all');
            foodTrailModal.style.display = 'block';
        }
    }

    foodTrailNavBtn?.addEventListener('click', openFoodModal);
    heroFoodBtn?.addEventListener('click', openFoodModal);
    closeFoodBtn?.addEventListener('click', () => {
        if (foodTrailModal) foodTrailModal.style.display = 'none';
    });

    foodFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            foodFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFoodItems(btn.dataset.type);
        });
    });

    // Close on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === bookingModal) bookingModal.style.display = 'none';
        if (e.target === myBookingsModal) myBookingsModal.style.display = 'none';
        if (e.target === wishlistModal) wishlistModal.style.display = 'none';
        if (e.target === budgetModal) budgetModal.style.display = 'none';
        if (e.target === packagesModal) packagesModal.style.display = 'none';
        if (e.target === paymentModal) paymentModal.style.display = 'none';
        if (e.target === ticketModal) ticketModal.style.display = 'none';
        if (e.target === itineraryModal) itineraryModal.style.display = 'none';
        if (e.target === routeFinderModal) routeFinderModal.style.display = 'none';
        if (e.target === foodTrailModal) foodTrailModal.style.display = 'none';
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
            if (videoIframe) videoIframe.src = '';
        }
    });

    // Initialize
    initTheme();
    renderUserNav();
    applyLanguage(currentLang);
    loadLocationsFromBackend();
});
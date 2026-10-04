const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting API Automated Integration Tests...\n');
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        user_type: 'explorer'
    };

    let token = null;

    try {
        // 1. Register
        console.log('1. Testing User Registration (/api/auth/register)...');
        const regRes = await makeRequest('/api/auth/register', 'POST', testUser);
        console.log(`   Status: ${regRes.status}`, regRes.body.message ? `-> ${regRes.body.message}` : regRes.body);
        if (regRes.status !== 201 || !regRes.body.token) {
            throw new Error('Registration test failed');
        }
        token = regRes.body.token;

        // 2. Login
        console.log('2. Testing User Login (/api/auth/login)...');
        const loginRes = await makeRequest('/api/auth/login', 'POST', {
            email: testUser.email,
            password: testUser.password
        });
        console.log(`   Status: ${loginRes.status} -> ${loginRes.body.message}`);
        if (loginRes.status !== 200) throw new Error('Login test failed');

        // 3. Profile / Me
        console.log('3. Testing Authenticated User Profile (/api/auth/me)...');
        const meRes = await makeRequest('/api/auth/me', 'GET', null, token);
        console.log(`   Status: ${meRes.status} -> User: ${meRes.body.user?.username} (${meRes.body.user?.user_type})`);
        if (meRes.status !== 200) throw new Error('Profile test failed');

        // 4. Locations List
        console.log('4. Testing Fetch Locations (/api/locations)...');
        const locRes = await makeRequest('/api/locations');
        console.log(`   Status: ${locRes.status} -> Total Locations: ${locRes.body.locations?.length}`);
        if (locRes.status !== 200 || !locRes.body.locations.length) throw new Error('Fetch locations failed');

        // 5. Locations Filter
        console.log('5. Testing Filter Locations (/api/locations?type=religious)...');
        const filterRes = await makeRequest('/api/locations?type=religious');
        console.log(`   Status: ${filterRes.status} -> Religious Places: ${filterRes.body.locations?.length}`);

        // 6. Create Booking
        console.log('6. Testing Booking Reservation (/api/bookings)...');
        const bookingRes = await makeRequest('/api/bookings', 'POST', {
            location_id: 'tirumala',
            location_name: 'Tirumala Temple',
            travel_date: '2026-10-15',
            guests: 2,
            contact_phone: '+91 9988776655',
            notes: 'Need early morning darshan guide'
        }, token);
        console.log(`   Status: ${bookingRes.status} -> ${bookingRes.body.message}`);
        if (bookingRes.status !== 201) throw new Error('Booking test failed');

        // 7. Get User Bookings
        console.log('7. Testing Get User Bookings (/api/bookings)...');
        const userBookings = await makeRequest('/api/bookings', 'GET', null, token);
        console.log(`   Status: ${userBookings.status} -> Bookings count: ${userBookings.body.bookings?.length}`);

        // 8. Add Review
        console.log('8. Testing Add Review (/api/reviews)...');
        const reviewRes = await makeRequest('/api/reviews', 'POST', {
            location_id: 'tirumala',
            rating: 5,
            comment: 'Divine experience and peaceful atmosphere!'
        }, token);
        console.log(`   Status: ${reviewRes.status} -> ${reviewRes.body.message}`);

        // 9. Fetch Location Reviews
        console.log('9. Testing Fetch Location Reviews (/api/reviews/tirumala)...');
        const getReviews = await makeRequest('/api/reviews/tirumala');
        console.log(`   Status: ${getReviews.status} -> Reviews count: ${getReviews.body.reviews?.length}`);

        // 10. Social Auth Test
        console.log('10. Testing Social Login (/api/auth/social)...');
        const socialRes = await makeRequest('/api/auth/social', 'POST', {
            provider: 'Google',
            user_type: 'traveller'
        });
        console.log(`   Status: ${socialRes.status} -> ${socialRes.body.message} (${socialRes.body.user?.username})`);
        if (socialRes.status !== 200 && socialRes.status !== 201) throw new Error('Social login test failed');

        // 11. Live Crowd Monitor API
        console.log('11. Testing Live Crowd Info API (/api/crowd/tirumala)...');
        const crowdRes = await makeRequest('/api/crowd/tirumala');
        console.log(`   Status: ${crowdRes.status} -> ${crowdRes.body.name}: ${crowdRes.body.crowd_level} (${crowdRes.body.occupancy_percent}%)`);
        if (crowdRes.status !== 200 || !crowdRes.body.crowd_level) throw new Error('Crowd info test failed');

        // 12. AI Itinerary Generator
        console.log('12. Testing AI Itinerary Generator (/api/itinerary/generate)...');
        const itinRes = await makeRequest('/api/itinerary/generate', 'POST', {
            destination: 'araku',
            days: 2,
            style: 'nature',
            pace: 'balanced'
        });
        console.log(`   Status: ${itinRes.status} -> ${itinRes.body.destination} (${itinRes.body.dayPlans?.length} Days)`);
        if (itinRes.status !== 200 || !itinRes.body.dayPlans?.length) throw new Error('Itinerary generator test failed');

        // 13. Transit Route & Distance Matrix
        console.log('13. Testing Transit Route & Distance Matrix (/api/routes/calculate)...');
        const routeRes = await makeRequest('/api/routes/calculate', 'POST', {
            origin: 'hyderabad',
            destination: 'tirupati'
        });
        console.log(`   Status: ${routeRes.status} -> ${routeRes.body.origin} to ${routeRes.body.destination}: ${routeRes.body.distanceKm} km (${routeRes.body.drivingTime})`);
        if (routeRes.status !== 200 || !routeRes.body.distanceKm) throw new Error('Route calculation test failed');

        console.log('\n✅ ALL 13 API TESTS PASSED SUCCESSFULLY!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test execution failed:', err.message);
        process.exit(1);
    }
}

runTests();

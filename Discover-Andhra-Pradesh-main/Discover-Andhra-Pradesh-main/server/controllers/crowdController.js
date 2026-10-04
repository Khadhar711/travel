const initialLocations = require('../data/initialLocations');

// Unique baseline telemetry for every single place in Andhra Pradesh
const crowdDatabase = {
    tirumala: { name: "Tirumala Temple", lat: 13.6788, lng: 79.3527, peak: "5 AM – 11 AM, 4 PM – 9 PM", best: "Tuesday & Wednesday early morning", baseOccupancy: 88, baseWaitMins: 180 },
    tiru: { name: "Tirumala Temple", lat: 13.6788, lng: 79.3527, peak: "5 AM – 11 AM, 4 PM – 9 PM", best: "Tuesday & Wednesday early morning", baseOccupancy: 88, baseWaitMins: 180 },
    
    araku: { name: "Araku Valley", lat: 18.3273, lng: 82.8824, peak: "11 AM – 3 PM", best: "Weekdays, 7 AM - 9 AM", baseOccupancy: 62, baseWaitMins: 25 },
    ara: { name: "Araku Valley", lat: 18.3273, lng: 82.8824, peak: "11 AM – 3 PM", best: "Weekdays, 7 AM - 9 AM", baseOccupancy: 62, baseWaitMins: 25 },
    
    lepakshi: { name: "Lepakshi Temple", lat: 13.8040, lng: 77.6083, peak: "10 AM – 1 PM", best: "Early morning sunrise", baseOccupancy: 38, baseWaitMins: 8 },
    lepa: { name: "Lepakshi Temple", lat: 13.8040, lng: 77.6083, peak: "10 AM – 1 PM", best: "Early morning sunrise", baseOccupancy: 38, baseWaitMins: 8 },
    
    belum: { name: "Belum Caves", lat: 15.1026, lng: 78.1187, peak: "11 AM – 3 PM", best: "Before 11 AM weekdays", baseOccupancy: 52, baseWaitMins: 30 },
    bel: { name: "Belum Caves", lat: 15.1026, lng: 78.1187, peak: "11 AM – 3 PM", best: "Before 11 AM weekdays", baseOccupancy: 52, baseWaitMins: 30 },
    
    borra: { name: "Borra Caves", lat: 18.2804, lng: 83.0396, peak: "12 PM – 4 PM", best: "9 AM – 11 AM", baseOccupancy: 68, baseWaitMins: 35 },
    bor: { name: "Borra Caves", lat: 18.2804, lng: 83.0396, peak: "12 PM – 4 PM", best: "9 AM – 11 AM", baseOccupancy: 68, baseWaitMins: 35 },
    
    undavalli: { name: "Undavalli Caves", lat: 16.4967, lng: 80.5815, peak: "3 PM – 5 PM", best: "4 PM for photography", baseOccupancy: 32, baseWaitMins: 5 },
    cave: { name: "Undavalli Caves", lat: 16.4967, lng: 80.5815, peak: "3 PM – 5 PM", best: "4 PM for photography", baseOccupancy: 32, baseWaitMins: 5 },
    unda: { name: "Undavalli Caves", lat: 16.4967, lng: 80.5815, peak: "3 PM – 5 PM", best: "4 PM for photography", baseOccupancy: 32, baseWaitMins: 5 },
    
    gandikota: { name: "Gandikota Fort & Canyon", lat: 14.8152, lng: 78.2861, peak: "4:30 PM – 6:30 PM (Sunset)", best: "5:30 AM Sunrise camping", baseOccupancy: 44, baseWaitMins: 10 },
    gan: { name: "Gandikota Fort & Canyon", lat: 14.8152, lng: 78.2861, peak: "4:30 PM – 6:30 PM (Sunset)", best: "5:30 AM Sunrise camping", baseOccupancy: 44, baseWaitMins: 10 },
    
    srisailam: { name: "Srisailam Temple", lat: 16.0748, lng: 78.8687, peak: "6 AM – 10 AM, 5 PM – 8 PM", best: "Wednesdays 6 AM", baseOccupancy: 78, baseWaitMins: 110 },
    srisai: { name: "Srisailam Temple", lat: 16.0748, lng: 78.8687, peak: "6 AM – 10 AM, 5 PM – 8 PM", best: "Wednesdays 6 AM", baseOccupancy: 78, baseWaitMins: 110 },
    
    simhachalam: { name: "Simhachalam Temple", lat: 17.7664, lng: 83.2407, peak: "8 AM – 12 PM", best: "1 PM – 3 PM", baseOccupancy: 71, baseWaitMins: 60 },
    simha: { name: "Simhachalam Temple", lat: 17.7664, lng: 83.2407, peak: "8 AM – 12 PM", best: "1 PM – 3 PM", baseOccupancy: 71, baseWaitMins: 60 },
    
    srikalahasti: { name: "Sri Kalahasti Temple", lat: 13.7498, lng: 79.6984, peak: "9 AM – 1 PM, 4 PM – 7 PM", best: "6 AM Rahu-Ketu Pooja", baseOccupancy: 81, baseWaitMins: 90 },
    srikala: { name: "Sri Kalahasti Temple", lat: 13.7498, lng: 79.6984, peak: "9 AM – 1 PM, 4 PM – 7 PM", best: "6 AM Rahu-Ketu Pooja", baseOccupancy: 81, baseWaitMins: 90 },
    
    visakhapatnam: { name: "Visakhapatnam Coast", lat: 17.6868, lng: 83.2185, peak: "4 PM – 8 PM", best: "6 AM Beach Walk", baseOccupancy: 74, baseWaitMins: 20 },
    rkbeach: { name: "RK Beach & Submarine Museum", lat: 17.7142, lng: 83.3236, peak: "5 PM – 8:30 PM", best: "6 AM – 8 AM", baseOccupancy: 83, baseWaitMins: 25 },
    
    ahobilam: { name: "Ahobilam Nine Temples", lat: 15.1333, lng: 78.7333, peak: "7 AM – 11 AM", best: "6 AM for Trekking", baseOccupancy: 35, baseWaitMins: 5 },
    aho: { name: "Ahobilam Nine Temples", lat: 15.1333, lng: 78.7333, peak: "7 AM – 11 AM", best: "6 AM for Trekking", baseOccupancy: 35, baseWaitMins: 5 },
    
    amaravati: { name: "Amaravati Stupa & Heritage", lat: 16.5744, lng: 80.3575, peak: "10 AM – 2 PM", best: "Morning 9 AM", baseOccupancy: 28, baseWaitMins: 0 },
    ama: { name: "Amaravati Stupa & Heritage", lat: 16.5744, lng: 80.3575, peak: "10 AM – 2 PM", best: "Morning 9 AM", baseOccupancy: 28, baseWaitMins: 0 },
    
    pulicat: { name: "Pulicat Lake Bird Sanctuary", lat: 13.6667, lng: 80.2000, peak: "6 AM – 9 AM (Birding)", best: "6 AM Sunrise", baseOccupancy: 22, baseWaitMins: 0 },
    puli: { name: "Pulicat Lake Bird Sanctuary", lat: 13.6667, lng: 80.2000, peak: "6 AM – 9 AM (Birding)", best: "6 AM Sunrise", baseOccupancy: 22, baseWaitMins: 0 },
    
    horsley: { name: "Horsley Hills Hill Station", lat: 13.6500, lng: 78.4000, peak: "11 AM – 4 PM", best: "7 AM Morning Fog", baseOccupancy: 48, baseWaitMins: 12 },
    hi: { name: "Horsley Hills Hill Station", lat: 13.6500, lng: 78.4000, peak: "11 AM – 4 PM", best: "7 AM Morning Fog", baseOccupancy: 48, baseWaitMins: 12 },
    horse: { name: "Horsley Hills Hill Station", lat: 13.6500, lng: 78.4000, peak: "11 AM – 4 PM", best: "7 AM Morning Fog", baseOccupancy: 48, baseWaitMins: 12 },
    
    kondapalli: { name: "Kondapalli Fort & Crafts", lat: 16.6186, lng: 80.5369, peak: "3 PM – 6 PM", best: "10 AM Morning", baseOccupancy: 36, baseWaitMins: 5 },
    kon: { name: "Kondapalli Fort & Crafts", lat: 16.6186, lng: 80.5369, peak: "3 PM – 6 PM", best: "10 AM Morning", baseOccupancy: 36, baseWaitMins: 5 },
    
    etikoppaka: { name: "Etikoppaka Toy Village", lat: 17.5167, lng: 82.7333, peak: "10 AM – 1 PM", best: "10 AM", baseOccupancy: 25, baseWaitMins: 0 },
    etti: { name: "Etikoppaka Toy Village", lat: 17.5167, lng: 82.7333, peak: "10 AM – 1 PM", best: "10 AM", baseOccupancy: 25, baseWaitMins: 0 },
    
    dindi: { name: "Dindi Backwaters", lat: 16.4833, lng: 81.9167, peak: "11 AM – 4 PM", best: "8 AM Morning Cruise", baseOccupancy: 42, baseWaitMins: 15 },
    penchalakona: { name: "Penchalakona Temple", lat: 14.3000, lng: 79.4167, peak: "9 AM – 1 PM", best: "7 AM", baseOccupancy: 53, baseWaitMins: 20 },
    coringa: { name: "Coringa Mangrove Sanctuary", lat: 16.8500, lng: 82.2333, peak: "8 AM – 11 AM", best: "7:30 AM Boating", baseOccupancy: 34, baseWaitMins: 10 },
    talakona: { name: "Talakona Waterfall", lat: 13.8055, lng: 79.2138, peak: "11 AM – 3 PM", best: "8 AM Trekking", baseOccupancy: 58, baseWaitMins: 15 },
    bhavani: { name: "Bhavani Island Resort", lat: 16.5200, lng: 80.5900, peak: "12 PM – 5 PM", best: "10 AM Ferry", baseOccupancy: 61, baseWaitMins: 15 },

    anantapur: { name: "Anantapur District", lat: 14.6819, lng: 77.6006, peak: "10 AM – 4 PM", best: "October to March", baseOccupancy: 30, baseWaitMins: 0 },
    chittoor: { name: "Chittoor District", lat: 13.2172, lng: 79.1003, peak: "9 AM – 5 PM", best: "September to February", baseOccupancy: 49, baseWaitMins: 10 },
    eastgodavari: { name: "East Godavari District", lat: 16.9891, lng: 82.2475, peak: "10 AM – 3 PM", best: "November to March", baseOccupancy: 44, baseWaitMins: 5 },
    guntur: { name: "Guntur District", lat: 16.3067, lng: 80.4365, peak: "10 AM – 4 PM", best: "October to March", baseOccupancy: 51, baseWaitMins: 10 },
    krishna: { name: "Krishna District", lat: 16.5062, lng: 80.6480, peak: "10 AM – 5 PM", best: "October to March", baseOccupancy: 57, baseWaitMins: 15 },
    kurnool: { name: "Kurnool District", lat: 15.8281, lng: 78.0373, peak: "10 AM – 4 PM", best: "October to March", baseOccupancy: 43, baseWaitMins: 0 },
    prakasam: { name: "Prakasam District", lat: 15.5057, lng: 80.0499, peak: "11 AM – 4 PM", best: "November to February", baseOccupancy: 33, baseWaitMins: 0 },
    nellore: { name: "Nellore District", lat: 14.4426, lng: 79.9865, peak: "10 AM – 4 PM", best: "December to February", baseOccupancy: 39, baseWaitMins: 0 },
    srikakulam: { name: "Srikakulam District", lat: 18.2969, lng: 83.8968, peak: "10 AM – 3 PM", best: "October to March", baseOccupancy: 31, baseWaitMins: 0 },
    vizianagaram: { name: "Vizianagaram District", lat: 18.1066, lng: 83.3955, peak: "10 AM – 3 PM", best: "October to March", baseOccupancy: 37, baseWaitMins: 0 },
    westgodavari: { name: "West Godavari District", lat: 16.7107, lng: 81.0952, peak: "10 AM – 3 PM", best: "November to March", baseOccupancy: 41, baseWaitMins: 0 },
    ysrkadapa: { name: "YSR Kadapa District", lat: 14.4673, lng: 78.8242, peak: "10 AM – 3 PM", best: "October to March", baseOccupancy: 38, baseWaitMins: 0 }
};

// Simple deterministic hash per locationId to prevent duplicates
function stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

exports.getLiveCrowdInfo = (req, res) => {
    const rawId = (req.params.locationId || 'tirumala').toLowerCase().trim();
    const locationId = rawId.replace(/[^a-z0-9]/g, '');
    
    // Find matching place or fallback
    let place = crowdDatabase[rawId] || crowdDatabase[locationId];

    if (!place) {
        // Search in initialLocations
        const match = initialLocations.find(l => {
            const cleanId = l.id.toLowerCase().replace(/[^a-z0-9]/g, '');
            return cleanId === locationId || cleanId.includes(locationId) || locationId.includes(cleanId);
        });

        if (match) {
            const hashVal = stringHash(match.id);
            const baseOcc = 30 + (hashVal % 55); // 30% to 85% unique
            place = {
                name: match.name,
                lat: match.latitude || 16.0,
                lng: match.longitude || 80.0,
                peak: "10 AM – 4 PM",
                best: match.best_time || "October to March",
                baseOccupancy: baseOcc,
                baseWaitMins: Math.round(baseOcc * 0.8)
            };
        } else {
            const hashVal = stringHash(locationId);
            const baseOcc = 35 + (hashVal % 50);
            place = {
                name: rawId.charAt(0).toUpperCase() + rawId.slice(1),
                lat: 16.0,
                lng: 80.0,
                peak: "10 AM – 3 PM",
                best: "October to March",
                baseOccupancy: baseOcc,
                baseWaitMins: Math.round(baseOcc * 0.6)
            };
        }
    }

    // Time-based live dynamic variation
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let timeMultiplier = 0.85;
    if ((hours >= 8 && hours <= 12) || (hours >= 16 && hours <= 20)) {
        timeMultiplier = 1.2;
    } else if (hours >= 22 || hours <= 5) {
        timeMultiplier = 0.35;
    }

    // Add unique seed offset per location to ensure zero duplicate numbers
    const locationSeed = (stringHash(locationId) % 11) - 5; // -5 to +5 unique shift
    const minFluctuation = Math.sin((minutes + stringHash(locationId)) * 0.1) * 4;
    
    let occupancy = Math.min(98, Math.max(12, Math.round((place.baseOccupancy * timeMultiplier) + locationSeed + minFluctuation)));

    let crowdLevel = 'Low 🟢';
    let statusColor = '#4caf50'; // Green
    let waitTime = place.baseWaitMins > 0 ? `${Math.round(place.baseWaitMins * (occupancy / 100))} - ${Math.round(place.baseWaitMins * (occupancy / 100) + 15)} Mins Queue` : 'Direct Entry (No Queue)';
    let trend = (minutes % 2 === 0) ? 'Increasing 📈' : 'Decreasing 📉';

    if (occupancy >= 75) {
        crowdLevel = 'Heavy 🔴';
        statusColor = '#f44336';
        if (place.baseWaitMins === 0) waitTime = '25 - 45 Mins Queue';
    } else if (occupancy >= 45) {
        crowdLevel = 'Moderate 🟡';
        statusColor = '#ff9800';
        if (place.baseWaitMins === 0) waitTime = '10 - 20 Mins Queue';
    }

    // Map locationId to map page name
    const mapPages = {
        tirumala: 'tiru.html', tiru: 'tiru.html',
        araku: 'ara.html', ara: 'ara.html',
        lepakshi: 'lepa.html', lepa: 'lepa.html',
        belum: 'bel.html', bel: 'bel.html',
        borra: 'bor.html', bor: 'bor.html',
        undavalli: 'cave.html', cave: 'cave.html', unda: 'unda.html',
        gandikota: 'gan.html', gan: 'gan.html',
        pulicat: 'puli.html', puli: 'puli.html',
        amaravati: 'ama.html', ama: 'ama.html',
        horsley: 'hi.html', hi: 'hi.html', horse: 'horse.html',
        simhachalam: 'simha.html', simha: 'simha.html',
        srisailam: 'srisai.html', srisai: 'srisai.html',
        ahobilam: 'aho.html', aho: 'aho.html',
        kondapalli: 'kon.html', kon: 'kon.html',
        etikoppaka: 'etti.html', etti: 'etti.html',
        srikalahasti: 'srikala.html', srikala: 'srikala.html'
    };

    res.json({
        location_id: locationId,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        crowd_level: crowdLevel,
        status_color: statusColor,
        occupancy_percent: occupancy,
        estimated_wait_time: waitTime,
        live_trend: trend,
        peak_hours: place.peak,
        best_time: place.best,
        map_url: mapPages[locationId] || 'tiru.html',
        last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
};

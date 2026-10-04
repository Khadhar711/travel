// Inter-city Transit, Distance & Route Matrix for Andhra Pradesh Destinations

const transitMatrix = {
    // Key: "origin_destination"
    "hyderabad_tirupati": { distKm: 550, carHrs: "9.5 hrs", route: "NH44 & NH716", trains: "7+ Daily (Sabari, Rayalaseema, Narayanadri Exp)", airport: "TIR (Direct 1h 10m flight)", busFare: "₹650 - ₹1200", cabEst: "₹8,500" },
    "bengaluru_tirupati": { distKm: 250, carHrs: "4.5 hrs", route: "NH69 & NH140", trains: "10+ Daily (Intercity, Vande Bharat, Seshadri Exp)", airport: "TIR (Direct 55m flight)", busFare: "₹350 - ₹750", cabEst: "₹4,200" },
    "chennai_tirupati": { distKm: 135, carHrs: "3.2 hrs", route: "NH716", trains: "15+ Daily (Sapthagiri, Garudadri Express)", airport: "TIR / MAA (Train preferred)", busFare: "₹180 - ₹400", cabEst: "₹2,600" },
    "vijayawada_tirupati": { distKm: 380, carHrs: "6.5 hrs", route: "NH16", trains: "18+ Daily (Pinakini, Circar, Jan Shatabdi)", airport: "TIR (1h direct)", busFare: "₹450 - ₹850", cabEst: "₹5,800" },
    "visakhapatnam_tirupati": { distKm: 780, carHrs: "13 hrs", route: "NH16 Coastal Corridor", trains: "12+ Daily (Tirumala Exp, Vande Bharat)", airport: "TIR (Direct 1h 35m flight)", busFare: "₹950 - ₹1600", cabEst: "₹12,000" },

    "hyderabad_araku": { distKm: 660, carHrs: "12 hrs", route: "NH65 to Vijayawada then NH16 to Vizag", trains: "Godavari / Visakha Exp to Vizag + Vistadome to Araku", airport: "VTZ (Direct 1h flight to Vizag)", busFare: "₹850 - ₹1500", cabEst: "₹10,500" },
    "bengaluru_araku": { distKm: 980, carHrs: "17 hrs", route: "NH16 via Chennai/Nellore", trains: "Prasanthi Express to Vizag", airport: "VTZ (Direct 1h 30m flight)", busFare: "₹1200 - ₹2100", cabEst: "₹15,000" },
    "chennai_araku": { distKm: 900, carHrs: "15.5 hrs", route: "NH16 Golden Quadrilateral", trains: "Coromandel / Howrah Mail to Vizag", airport: "VTZ (Direct 1h 15m flight)", busFare: "₹1100 - ₹1900", cabEst: "₹14,000" },
    "vijayawada_araku": { distKm: 460, carHrs: "8.5 hrs", route: "NH16 via Rajahmundry", trains: "Ratnachal / Vande Bharat to Vizag", airport: "VTZ (Nearest Airport 110km)", busFare: "₹500 - ₹950", cabEst: "₹7,200" },
    "visakhapatnam_araku": { distKm: 115, carHrs: "3 hrs", route: "Ghat Road SH9", trains: "Vistadome Glass Train (05851 Express)", airport: "VTZ (115 km)", busFare: "₹120 - ₹250", cabEst: "₹2,200" },

    "hyderabad_gandikota": { distKm: 380, carHrs: "7 hrs", route: "NH44 to Kurnool then NH40", trains: "Kacheguda - Kadapa Express to Muddanuru (30km)", airport: "KJB (Kadapa Airport 85km)", busFare: "₹450 - ₹850", cabEst: "₹6,000" },
    "bengaluru_gandikota": { distKm: 280, carHrs: "5.5 hrs", route: "NH44 via Anantapur & Tadipatri", trains: "Bangalore - Nandyal Exp to Muddanuru", airport: "BLR (280 km) / KJB (85 km)", busFare: "₹380 - ₹700", cabEst: "₹4,500" },
    "chennai_gandikota": { distKm: 370, carHrs: "7 hrs", route: "NH716 via Renigunta & Kadapa", trains: "Chennai - Mumbai Mail to Muddanuru", airport: "KJB (85 km)", busFare: "₹480 - ₹850", cabEst: "₹5,800" },
    "vijayawada_gandikota": { distKm: 380, carHrs: "7 hrs", route: "NH544D via Markapur & Nandyal", trains: "Amaravati Exp to Gooty/Tadipatri", airport: "KJB (85 km)", busFare: "₹450 - ₹800", cabEst: "₹6,000" },
    "visakhapatnam_gandikota": { distKm: 760, carHrs: "13.5 hrs", route: "NH16 to Vijayawada then NH544D", trains: "Vizag - Tirupati Exp to Renigunta + Cab", airport: "VTZ / KJB", busFare: "₹950 - ₹1700", cabEst: "₹12,500" },

    "hyderabad_srisailam": { distKm: 215, carHrs: "4.5 hrs", route: "NH765 Srisailam Highway", trains: "Nearest station: Markapur Road (85km)", airport: "HYD (RGIA 190km - closest airport)", busFare: "₹280 - ₹550", cabEst: "₹3,800" },
    "bengaluru_srisailam": { distKm: 530, carHrs: "10 hrs", route: "NH44 to Kurnool then Atmakur Ghats", trains: "Train to Kurnool City + KSRTC/APSRTC Bus", airport: "HYD / BLR", busFare: "₹650 - ₹1200", cabEst: "₹8,000" },
    "chennai_srisailam": { distKm: 470, carHrs: "9.5 hrs", route: "NH16 to Ongole then Giddalur Road", trains: "Train to Markapur Road Station (85km)", airport: "VGA / MAA", busFare: "₹580 - ₹1100", cabEst: "₹7,200" },
    "vijayawada_srisailam": { distKm: 260, carHrs: "5.5 hrs", route: "SH31 via Guntur & Vinukonda", trains: "Direct APSRTC Ultra Deluxe Buses", airport: "VGA (Gannavaram 280km)", busFare: "₹320 - ₹600", cabEst: "₹4,200" },
    "visakhapatnam_srisailam": { distKm: 610, carHrs: "11 hrs", route: "NH16 to Vijayawada then Vinukonda", trains: "Train to Vijayawada + Direct Express Bus", airport: "VTZ / VGA", busFare: "₹750 - ₹1400", cabEst: "₹9,800" }
};

exports.calculateRoute = (req, res) => {
    const origin = (req.body.origin || 'hyderabad').toLowerCase().trim();
    const destination = (req.body.destination || 'tirupati').toLowerCase().trim();

    // Map common aliases
    let destKey = destination;
    if (destination.includes('tirupati') || destination.includes('tirumala') || destination.includes('chittoor')) {
        destKey = 'tirupati';
    } else if (destination.includes('araku') || destination.includes('borra') || destination.includes('vizag') || destination.includes('visakhapatnam')) {
        destKey = 'araku';
    } else if (destination.includes('gandikota') || destination.includes('belum') || destination.includes('canyon') || destination.includes('kurnool')) {
        destKey = 'gandikota';
    } else if (destination.includes('srisailam')) {
        destKey = 'srisailam';
    } else {
        destKey = 'tirupati';
    }

    let originKey = origin;
    if (!['hyderabad', 'bengaluru', 'chennai', 'vijayawada', 'visakhapatnam'].includes(originKey)) {
        originKey = 'hyderabad';
    }

    const routeKey = `${originKey}_${destKey}`;
    const result = transitMatrix[routeKey] || transitMatrix["hyderabad_tirupati"];

    const formatName = str => str.charAt(0).toUpperCase() + str.slice(1);

    res.json({
        origin: formatName(originKey),
        destination: formatName(destKey),
        distanceKm: result.distKm,
        drivingTime: result.carHrs,
        highwayRoute: result.route,
        trainOptions: result.trains,
        flightOptions: result.airport,
        estimatedBusFare: result.busFare,
        estimatedCabFare: result.cabEst,
        scenicHighlights: [
            "Scenic viewpoints & rest stops along the highway.",
            "Toll gates with FASTag enabled throughout.",
            "Clean highway food courts & fueling stations."
        ]
    });
};

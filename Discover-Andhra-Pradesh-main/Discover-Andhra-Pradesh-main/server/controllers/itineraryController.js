// Itinerary generation engine based on destination, duration, and style

const itineraryTemplates = {
    tirupati: {
        title: "Tirupati & Tirumala Spiritual Circuit",
        region: "Rayalaseema",
        spiritual: {
            day1: [
                { time: "06:00 AM - 08:30 AM", title: "Early Morning Alipiri Footpath or Ghat Road Ascent", desc: "Ascend the sacred Seshachalam hills to Tirumala.", icon: "🌄" },
                { time: "09:00 AM - 12:30 PM", title: "Sri Venkateswara Swamy Temple Darshan", desc: "Experience the divine sanctum darshan and receive the sacred Tirupati Laddu Prasadam.", icon: "🕉️" },
                { time: "01:00 PM - 02:00 PM", title: "Traditional South Indian Satvik Lunch", desc: "Enjoy wholesome meals at Annaprasadam Complex or local vegetarian dining.", icon: "🍱" },
                { time: "03:00 PM - 05:00 PM", title: "Silathoranam & Chakra Theertham Visit", desc: "Witness the rare natural geological rock arch and sacred waterfalls in Tirumala.", icon: "🌿" },
                { time: "06:30 PM - 08:30 PM", title: "Evening Sahasra Deepalankarana Seva", desc: "View the celestial lamps lighting ceremony around the temple perimeter.", icon: "🪔" }
            ],
            day2: [
                { time: "07:00 AM - 09:30 AM", title: "Padmavathi Ammavari Temple, Tiruchanur", desc: "Seek blessings of Goddess Padmavathi at the holy lake temple.", icon: "🌸" },
                { time: "10:30 AM - 01:00 PM", title: "Sri Kalahasti Temple (Rahu-Ketu Kshetram)", desc: "Visit the ancient Vayu Lingam temple on the banks of River Swarnamukhi.", icon: "🕉️" },
                { time: "02:00 PM - 04:30 PM", title: "Chandragiri Fort & Light Show", desc: "Explore the 11th-century Vijayanagara palace and historical museum.", icon: "🏰" }
            ],
            day3: [
                { time: "08:00 AM - 12:00 PM", title: "Talakona Waterfall & Forest Trek", desc: "Discover Andhra's highest waterfall amidst lush biodiversity.", icon: "🌊" },
                { time: "02:00 PM - 05:00 PM", title: "Kanipakam Varasiddhi Vinayaka Temple", desc: "Witness the self-manifested Swayambhu Ganesha temple in Chittoor.", icon: "🕉️" }
            ]
        },
        family: {
            day1: [
                { time: "08:00 AM - 11:30 AM", title: "Tirumala Temple Guided Darshan", desc: "Comfortable family darshan with special assistance.", icon: "🕉️" },
                { time: "12:30 PM - 02:00 PM", title: "Lunch & Laddu Prasadam Collection", desc: "Sample authentic regional sweets and savory meals.", icon: "🍱" },
                { time: "03:30 PM - 06:00 PM", title: "Sri Venkateswara Zoological Park", desc: "Tour Asia's second largest zoo featuring wildlife safari for all ages.", icon: "🦁" }
            ],
            day2: [
                { time: "08:30 AM - 11:30 AM", title: "Regional Science Centre & Planetarium", desc: "Interactive science exhibits and sky shows for children.", icon: "🔭" },
                { time: "02:00 PM - 05:30 PM", title: "Chandragiri Heritage Fort & Gardens", desc: "Spacious gardens, sound & light show, and royal palace.", icon: "🏰" }
            ],
            day3: [
                { time: "09:00 AM - 02:00 PM", title: "Talakona Canopy Walk & Waterfalls", desc: "Scenic nature walk with suspended bridge across forest canopy.", icon: "🌲" }
            ]
        }
    },
    araku: {
        title: "Araku Valley & Visakhapatnam Coastal Trail",
        region: "North Coastal Andhra",
        nature: {
            day1: [
                { time: "06:30 AM - 10:30 AM", title: "Scenic Vistadome Train to Araku", desc: "Spectacular rail journey through 58 tunnels and rolling green valleys.", icon: "🚂" },
                { time: "11:00 AM - 01:30 PM", title: "Borra Caves Exploration", desc: "Walk through million-year-old limestone stalactites and stalagmites.", icon: "🪨" },
                { time: "02:00 PM - 03:00 PM", title: "Authentic Araku Bamboo Chicken Lunch", desc: "Taste the indigenous tribal dish cooked in fresh green bamboo stalks.", icon: "🍗" },
                { time: "04:00 PM - 06:00 PM", title: "Katiki Waterfalls Excursion", desc: "Off-road jeep ride to the roaring perennial waterfall amidst bamboo groves.", icon: "🌊" }
            ],
            day2: [
                { time: "06:00 AM - 08:30 AM", title: "Chaparai Water Cascades & Sunrise", desc: "Gentle natural water stream flowing over smooth, sloping rocks.", icon: "🌄" },
                { time: "09:30 AM - 12:00 PM", title: "Organic Coffee Plantations & Tasting", desc: "Sample world-renowned organic Araku Arabica coffee at local estates.", icon: "☕" },
                { time: "01:30 PM - 03:30 PM", title: "Araku Tribal Museum & Padmapuram Gardens", desc: "Learn about indigenous tribal heritage and see tree-top hanging cottages.", icon: "🏛️" },
                { time: "05:00 PM - 07:00 PM", title: "Sunset at Galikonda View Point", desc: "Highest peak in Visakhapatnam district with sweeping misty valley views.", icon: "🌅" }
            ],
            day3: [
                { time: "09:00 AM - 01:00 PM", title: "Descent to Visakhapatnam Coastal Belt", desc: "Drive down the ghat road enjoying fresh pine air.", icon: "🚗" },
                { time: "02:30 PM - 05:00 PM", title: "Kailasagiri Hilltop & Ropeway Cable Car", desc: "Panoramic view of the Bay of Bengal coastline with giant Shiva-Parvati statue.", icon: "🚠" },
                { time: "05:30 PM - 08:00 PM", title: "RK Beach, INS Kursura Submarine Museum", desc: "Tour inside a real decommissioned submarine on the golden sands.", icon: "⚓" }
            ]
        }
    },
    gandikota: {
        title: "Gandikota Grand Canyon & Belum Underground Caves",
        region: "Rayalaseema",
        adventure: {
            day1: [
                { time: "07:00 AM - 10:00 AM", title: "Arrival at Gandikota & Fort Entry", desc: "Cross the massive fortified stone gateways of the 13th-century fort.", icon: "🏰" },
                { time: "10:30 AM - 01:00 PM", title: "Pennar River Gorge & Canyon Clifftop Walk", desc: "Marvel at the 'Grand Canyon of India' carving through Erramala hills.", icon: "🏜️" },
                { time: "02:00 PM - 04:00 PM", title: "Madhavaraya Temple & Jamia Masjid", desc: "Admire exquisite Vijayanagara carvings and grand Islamic architecture side by side.", icon: "🕌" },
                { time: "05:00 PM - 06:30 PM", title: "Sunset Camping & Kayaking in Pennar River", desc: "Paddle through the gorge waters and pitch cliffside tents.", icon: "⛺" }
            ],
            day2: [
                { time: "06:00 AM - 08:00 AM", title: "Sunrise Photography & Canyon Trek", desc: "Golden morning sunbeams bathing the red granite canyon rocks.", icon: "📸" },
                { time: "09:30 AM - 12:30 PM", title: "Belum Caves Underground Expedition", desc: "Walk through India's second largest underground natural cave network.", icon: "🕳️" },
                { time: "01:30 PM - 03:00 PM", title: "Rayalaseema Ragi Sankati with Natukodi Lunch", desc: "Hearty traditional meal seasoned with authentic country spices.", icon: "🍲" },
                { time: "03:30 PM - 06:00 PM", title: "Yaganti Temple (Pushkarini & Growing Nandi)", desc: "Ancient Shiva temple famous for its mysterious growing stone bull.", icon: "🕉️" }
            ],
            day3: [
                { time: "08:00 AM - 11:30 AM", title: "Kurnool Konda Reddy Buruju Fort", desc: "Historic bastion fortress in the heart of Kurnool city.", icon: "🏰" },
                { time: "01:00 PM - 04:00 PM", title: "Oravakallu Rock Garden", desc: "Rare quartz and silica rock formations with boating lake.", icon: "🪨" }
            ]
        }
    },
    srisailam: {
        title: "Srisailam Jyotirlinga & Nallamala Wilderness",
        region: "Nallamala Hills",
        spiritual: {
            day1: [
                { time: "07:00 AM - 10:00 AM", title: "Drive through Nallamala Forest Reserve", desc: "Scenic forest drive through India's largest tiger reserve.", icon: "🌲" },
                { time: "10:30 AM - 01:30 PM", title: "Mallikarjuna Swamy Temple (Jyotirlinga & Shakti Peetha)", desc: "Ancient sanctum holding both a holy Jyotirlinga and Bhramaramba Shakti Peetha.", icon: "🕉️" },
                { time: "02:30 PM - 04:30 PM", title: "Pathalaganga Ropeway & Holy Krishna River Dip", desc: "Cable car descent to the sacred waters of Krishna River.", icon: "🚡" },
                { time: "05:00 PM - 07:00 PM", title: "Srisailam Dam Viewpoint & Sunset", desc: "Massive hydroelectric dam spanning across the deep river gorge.", icon: "🌊" }
            ],
            day2: [
                { time: "06:30 AM - 10:00 AM", title: "Akka Mahadevi Caves Motorboat Safari", desc: "16-km picturesque boat ride on Krishna River to natural limestone caves.", icon: "🚤" },
                { time: "11:00 AM - 01:00 PM", title: "Sakshi Ganapathi Temple Visit", desc: "Ganesha who records the pilgrimage of every devotee visiting Srisailam.", icon: "🐘" },
                { time: "02:00 PM - 05:00 PM", title: "Phaladehara Panchadhara Waterfalls", desc: "Sacred cascade where Adi Shankaracharya penned Sivanandalahari.", icon: "💧" }
            ]
        }
    }
};

exports.generateItinerary = (req, res) => {
    const { destination, days = 2, style = 'spiritual', pace = 'balanced' } = req.body;
    const destKey = (destination || 'tirupati').toLowerCase().replace(/[^a-z]/g, '');

    let template = itineraryTemplates[destKey] || itineraryTemplates.tirupati;
    if (destKey.includes('araku') || destKey.includes('vizag') || destKey.includes('visakhapatnam')) {
        template = itineraryTemplates.araku;
    } else if (destKey.includes('gandikota') || destKey.includes('belum') || destKey.includes('canyon')) {
        template = itineraryTemplates.gandikota;
    } else if (destKey.includes('srisailam')) {
        template = itineraryTemplates.srisailam;
    }

    const availableStyles = Object.keys(template).filter(k => k !== 'title' && k !== 'region');
    const selectedStyle = template[style] ? style : availableStyles[0];
    const styleData = template[selectedStyle];

    const numDays = Math.min(Math.max(parseInt(days, 10) || 2, 1), 3);
    const dayPlans = [];

    for (let d = 1; d <= numDays; d++) {
        const dayKey = `day${d}`;
        let activities = styleData[dayKey] || styleData.day1;
        
        // If pace is relaxed, omit the last activity
        if (pace === 'relaxed' && activities.length > 3) {
            activities = activities.slice(0, -1);
        }

        dayPlans.push({
            dayNumber: d,
            title: `Day ${d}: ${d === 1 ? 'Arrival & Key Highlights' : d === 2 ? 'Deep Heritage & Nature Trail' : 'Scenic Excursions & Farewell'}`,
            activities
        });
    }

    const estCostPerPerson = numDays * (style === 'adventure' ? 1800 : style === 'nature' ? 2200 : 1600);

    res.json({
        destination: template.title,
        region: template.region,
        totalDays: numDays,
        style: selectedStyle,
        pace: pace,
        estimatedCostINR: estCostPerPerson,
        dayPlans,
        travelTips: [
            "Carry valid Govt Photo ID for temple darshan and wildlife sanctuary entry.",
            "Wear comfortable walking shoes for temple premises and stone pathways.",
            "Pre-booking recommended on weekends to avoid queue delays.",
            "Stay hydrated with local coconut water and fresh sugarcane juice."
        ],
        recommendedDishes: [
            "Tirupati Srivari Laddu",
            "Araku Bamboo Chicken",
            "Rayalaseema Ragi Sankati",
            "Atreyapuram Pootharekulu"
        ]
    });
};

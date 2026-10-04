exports.calculateBudget = (req, res) => {
    const { days, guests, style, transport } = req.body;

    const numDays = parseInt(days) || 2;
    const numGuests = parseInt(guests) || 1;
    const stayStyle = style || 'standard'; // budget, standard, luxury
    const transportType = transport || 'public'; // public, private

    // Per day rates per person in INR
    const stayRates = { budget: 800, standard: 2000, luxury: 4500 };
    const foodRate = 600; // per day per person
    const transportRates = { public: 300, private: 1200 }; // per day
    const entryFeeRate = 200; // per location/day

    const stayCost = (stayRates[stayStyle] || 2000) * numDays * numGuests;
    const foodCost = foodRate * numDays * numGuests;
    const transportCost = (transportRates[transportType] || 500) * numDays;
    const ticketCost = entryFeeRate * numGuests;

    const totalEstimate = stayCost + foodCost + transportCost + ticketCost;

    res.json({
        days: numDays,
        guests: numGuests,
        style: stayStyle,
        transport: transportType,
        breakdown: {
            accommodation: stayCost,
            food_and_dining: foodCost,
            transportation: transportCost,
            sightseeing_and_tickets: ticketCost
        },
        totalEstimateINR: totalEstimate,
        perPersonINR: Math.round(totalEstimate / numGuests)
    });
};

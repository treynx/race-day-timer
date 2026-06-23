const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Global Race Variables
let raceStartTime = null; // Stored as a timestamp millisecond value when started
const checkIns = [];

// Endpoint to START the race (Admin feature)
app.post('/api/race/start', (req, res) => {
    if (!raceStartTime) {
        raceStartTime = Date.now();
        console.log(`🏁 RACE STARTED AT: ${new Date(raceStartTime).toLocaleTimeString()}`);
    }
    res.json({ success: true, raceStartTime });
});

// Endpoint to RESET the race if you need to re-test
app.post('/api/race/reset', (req, res) => {
    raceStartTime = null;
    checkIns.length = 0; // Clears the array
    console.log("🔄 Race and database reset for testing.");
    res.json({ success: true, message: "Race reset successfully." });
});

// Endpoint for frontend to check the clock status
app.get('/api/race/status', (req, res) => {
    res.json({ raceStartTime });
});

// Post a runner check-in
app.post('/api/checkin', (req, res) => {
    const { email, firstName, lastName } = req.body;
    const now = Date.now();
    
    // Calculate elapsed race time if the race has begun
    let elapsedMs = null;
    if (raceStartTime && now > raceStartTime) {
        elapsedMs = now - raceStartTime;
    }

    const newCheckIn = { 
        email, 
        firstName, 
        lastName, 
        timestamp: new Date(now).toISOString(),
        elapsedMs 
    };
    
    checkIns.push(newCheckIn);
    console.log("👉 CHECK-IN:", newCheckIn);
    res.status(200).json({ success: true, data: newCheckIn });
});

// Fetch all registered runners
app.get('/api/runners', (req, res) => {
    res.json(checkIns);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Point Express to the race-timer-app/public directory for static files
app.use(express.static(path.join(__dirname, 'race-timer-app/public')));

// In-Memory State Engines
let raceStartTime = null;
let runners = []; 

// --- API ENDPOINTS ---

app.get('/api/race/status', (req, res) => {
    res.json({ raceStartTime });
});

app.post('/api/race/start', (req, res) => {
    if (!raceStartTime) {
        raceStartTime = Date.now();
    }
    res.json({ success: true, raceStartTime });
});

app.post('/api/race/reset', (req, res) => {
    raceStartTime = null;
    runners = [];
    res.json({ success: true });
});

app.get('/api/runners', (req, res) => {
    res.json(runners);
});

app.post('/api/checkin', (req, res) => {
    const { firstName, lastName } = req.body;
    
    // Validate inputs
    if (!firstName || !lastName || typeof firstName !== 'string' || typeof lastName !== 'string') {
        return res.status(400).json({ success: false, error: "Missing or invalid identity tags." });
    }
    
    // Sanitize and validate length
    const sanitizedFirstName = firstName.trim().substring(0, 50);
    const sanitizedLastName = lastName.trim().substring(0, 50);
    
    if (!sanitizedFirstName || !sanitizedLastName) {
        return res.status(400).json({ success: false, error: "Names cannot be empty." });
    }

    const now = Date.now();
    const totalElapsedMs = raceStartTime ? (now - raceStartTime) : 0;

    let runner = runners.find(r => 
        r.firstName.toLowerCase() === sanitizedFirstName.toLowerCase() && 
        r.lastName.toLowerCase() === sanitizedLastName.toLowerCase()
    );

    if (!runner) {
        runner = {
            id: `runner-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            firstName: sanitizedFirstName,
            lastName: sanitizedLastName,
            laps: 1,
            timestamp: now,
            elapsedMs: totalElapsedMs,
            lastLapMs: totalElapsedMs
        };
        runners.push(runner);
    } else {
        const lapMs = totalElapsedMs - runner.elapsedMs;
        runner.laps += 1;
        runner.timestamp = now;
        runner.lastLapMs = lapMs;
        runner.elapsedMs = totalElapsedMs;
    }

    res.json({ success: true, runner });
});

// Fallback logic: Send index.html from the static directory
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'race-timer-app/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Churn & Burn engine roaring on port ${PORT}`);
});

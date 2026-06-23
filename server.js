const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static frontend assets cleanly
app.use(express.static(path.join(__dirname)));

// In-Memory State Engines
let raceStartTime = null;
let runners = []; 

// --- API ENDPOINTS ---

// 1. Get current tracking status
app.get('/api/race/status', (req, res) => {
    res.json({ raceStartTime });
});

// 2. Start the master backyard clock
app.post('/api/race/start', (req, res) => {
    if (!raceStartTime) {
        raceStartTime = Date.now();
    }
    res.json({ success: true, raceStartTime });
});

// 3. Clear data and reset environment
app.post('/api/race/reset', (req, res) => {
    raceStartTime = null;
    runners = [];
    res.json({ success: true });
});

// 4. Get entire runner roster state
app.get('/api/runners', (req, res) => {
    res.json(runners);
});

// 5. Check-In / Log Loop Entry Point
app.post('/api/checkin', (req, res) => {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
        return res.status(400).json({ success: false, error: "Missing identity tags." });
    }

    const now = Date.now();
    const totalElapsedMs = raceStartTime ? (now - raceStartTime) : 0;
    const currentHourWindow = 3600000;

    // Find if the competitor already exists
    let runner = runners.find(r => 
        r.firstName.toLowerCase() === firstName.toLowerCase() && 
        r.lastName.toLowerCase() === lastName.toLowerCase()
    );

    if (!runner) {
        // Brand new entry initialization
        runner = {
            id: `runner-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            firstName,
            lastName,
            laps: 1,
            timestamp: now,
            elapsedMs: totalElapsedMs,
            lastLapMs: totalElapsedMs
        };
        runners.push(runner);
    } else {
        // Calculate incremental loop delta split time
        const lapMs = totalElapsedMs - runner.elapsedMs;
        runner.laps += 1;
        runner.timestamp = now;
        runner.lastLapMs = lapMs;
        runner.elapsedMs = totalElapsedMs;
    }

    res.json({ success: true, runner });
});

// Serve frontend route fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Churn & Burn engine roaring on port ${PORT}`);
});

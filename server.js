const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Tell the server where to look for assets (like styles/scripts) inside your folder
app.use(express.static(path.join(__dirname, 'race-timer-app', 'public')));
app.use(express.static(path.join(__dirname, 'race-timer-app')));

// Homepage Route: Steps into the nested folder to grab the HTML file
app.get('/', (req, res) => {
    const path1 = path.join(__dirname, 'race-timer-app', 'public', 'index.html');
    const path2 = path.join(__dirname, 'race-timer-app', 'index.html');
    
    if (fs.existsSync(path1)) {
        return res.sendFile(path1);
    } else if (fs.existsSync(path2)) {
        return res.sendFile(path2);
    } else {
        // Fallback debug error check
        const filesInsideFolder = fs.existsSync(path.join(__dirname, 'race-timer-app')) 
            ? fs.readdirSync(path.join(__dirname, 'race-timer-app')) 
            : [];
        res.status(404).send(`<h3>Almost there!</h3><p>Found the 'race-timer-app' folder, but it contains: <b>${filesInsideFolder.join(', ') || 'nothing'}</b> instead of index.html</p>`);
    }
});

// Global Race Variables
let raceStartTime = null; 
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
    checkIns.length = 0; 
    console.log("🔄 Race and database reset.");
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

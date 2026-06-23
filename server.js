const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Assets routing
app.use(express.static(path.join(__dirname, 'race-timer-app', 'public')));
app.use(express.static(path.join(__dirname, 'race-timer-app')));

// 1. PUBLIC RUNNER PORTAL (Normal Link)
app.get('/', (req, res) => {
    const path1 = path.join(__dirname, 'race-timer-app', 'public', 'index.html');
    const path2 = path.join(__dirname, 'race-timer-app', 'index.html');
    const targetFile = fs.existsSync(path1) ? path1 : path2;
    res.sendFile(targetFile);
});

// 2. PRIVATE ADMINISTRATIVE PORTAL (Secret Link)
app.get('/admin', (req, res) => {
    const path1 = path.join(__dirname, 'race-timer-app', 'public', 'index.html');
    const path2 = path.join(__dirname, 'race-timer-app', 'index.html');
    const targetFile = fs.existsSync(path1) ? path1 : path2;
    res.sendFile(targetFile);
});

// --- API Endpoints ---
let raceStartTime = null; 
const checkIns = [];

app.post('/api/race/start', (req, res) => {
    if (!raceStartTime) raceStartTime = Date.now();
    res.json({ success: true, raceStartTime });
});

app.post('/api/race/reset', (req, res) => {
    raceStartTime = null;
    checkIns.length = 0; 
    res.json({ success: true });
});

app.get('/api/race/status', (req, res) => {
    res.json({ raceStartTime });
});

app.post('/api/checkin', (req, res) => {
    const { email, firstName, lastName } = req.body;
    const now = Date.now();
    let elapsedMs = raceStartTime && now > raceStartTime ? now - raceStartTime : null;
    const newCheckIn = { email, firstName, lastName, timestamp: new Date(now).toISOString(), elapsedMs };
    checkIns.push(newCheckIn);
    res.status(200).json({ success: true, data: newCheckIn });
});

app.get('/api/runners', (req, res) => {
    res.json(checkIns);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

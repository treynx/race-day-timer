const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Try to serve static files normally first
app.use(express.static('public'));
app.use(express.static(__dirname));

// ULTIMATE OVERRIDE ROUTE: Force the server to look for the file and send it
app.get('/', (req, res) => {
    const rootPath = path.join(__dirname, 'index.html');
    const publicPath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(publicPath)) {
        return res.sendFile(publicPath);
    } else if (fs.existsSync(rootPath)) {
        return res.sendFile(rootPath);
    } else {
        // If it still fails, this message will print on your screen telling us exactly what the server sees!
        const filesInRoot = fs.readdirSync(__dirname);
        res.status(404).send(`<h3>Could not find index.html</h3><p>Files found in your server's root folder: <b>${filesInRoot.join(', ')}</b></p>`);
    }
});

// Global Race Variables
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

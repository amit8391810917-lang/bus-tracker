const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Bus state
let busState = {
    isRunning: false,
    currentIndex: 0,
    route: [
        [26.7271, 88.3953],
        [26.7300, 88.4000],
        [26.7350, 88.4050],
        [26.7400, 88.4100]
    ],
    busName: 'College Bus 1'
};

let busInterval = null;

// Helper function to move bus
function moveBus() {
    if (busState.currentIndex < busState.route.length - 1) {
        busState.currentIndex++;
    } else {
        busState.currentIndex = 0;
    }
}

// API Endpoints

// GET - Get current bus status and location
app.get('/api/bus/status', (req, res) => {
    res.json({
        isRunning: busState.isRunning,
        busName: busState.busName,
        currentLocation: busState.route[busState.currentIndex],
        route: busState.route,
        message: busState.isRunning ? 'Bus is running' : 'Bus is stopped'
    });
});

// POST - Start bus
app.post('/api/bus/start', (req, res) => {
    if (busState.isRunning) {
        return res.status(400).json({ error: 'Bus is already running' });
    }

    busState.isRunning = true;

    // Move bus every 3 seconds
    busInterval = setInterval(moveBus, 3000);

    res.json({
        success: true,
        message: 'Bus started',
        status: busState.isRunning
    });
});

// POST - Stop bus
app.post('/api/bus/stop', (req, res) => {
    if (!busState.isRunning) {
        return res.status(400).json({ error: 'Bus is already stopped' });
    }

    busState.isRunning = false;
    clearInterval(busInterval);

    res.json({
        success: true,
        message: 'Bus stopped',
        status: busState.isRunning
    });
});

// GET - Get all route coordinates
app.get('/api/bus/route', (req, res) => {
    res.json({
        route: busState.route,
        totalWaypoints: busState.route.length
    });
});

// POST - Reset bus to starting position
app.post('/api/bus/reset', (req, res) => {
    busState.currentIndex = 0;
    if (busState.isRunning) {
        clearInterval(busInterval);
        busState.isRunning = false;
    }

    res.json({
        success: true,
        message: 'Bus reset to starting position',
        currentLocation: busState.route[0]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚌 Bus Tracker Backend running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /api/bus/status  - Get bus status and location');
    console.log('  POST /api/bus/start   - Start the bus');
    console.log('  POST /api/bus/stop    - Stop the bus');
    console.log('  GET  /api/bus/route   - Get all route coordinates');
    console.log('  POST /api/bus/reset   - Reset bus to start');
});

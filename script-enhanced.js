// Enhanced script to work with backend API
const API_URL = 'http://localhost:3000/api/bus';

// Initialize Map
var map = L.map('map').setView([26.7271, 88.3953], 13);

// OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Route coordinates
var route = [
    [26.7271, 88.3953],
    [26.7300, 88.4000],
    [26.7350, 88.4050],
    [26.7400, 88.4100]
];

// Draw route line
var polyline = L.polyline(route, {color: 'blue'}).addTo(map);

// Bus marker
var busMarker = L.marker(route[0]).addTo(map);

var pollInterval;

// Fetch bus status from backend
function fetchBusStatus() {
    fetch(`${API_URL}/status`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("status").innerText = data.isRunning ? "Running" : "Stopped";
            busMarker.setLatLng(data.currentLocation);
        })
        .catch(error => console.error('Error fetching status:', error));
}

// Start bus via API
function startBus() {
    fetch(`${API_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Poll the server for location updates
        pollInterval = setInterval(fetchBusStatus, 3000);
    })
    .catch(error => console.error('Error starting bus:', error));
}

// Stop bus via API
function stopBus() {
    fetch(`${API_URL}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        clearInterval(pollInterval);
    })
    .catch(error => console.error('Error stopping bus:', error));
}

// Initial status fetch
fetchBusStatus();

// Initialize Leaflet Map
var map = L.map('map').setView([22.5726, 88.3639], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// User location
var userMarker = null;
var userLocation = null;

// Bus data
var buses = [
    {
        id: 1,
        name: 'Howrah Metro Bus',
        route: 'Howrah → Esplanade',
        color: '#ff6b6b',
        icon: '<i class="fas fa-bus" style="color: #ff6b6b;"></i>',
        stops: [
            { name: 'Howrah Station', time: '08:00', coords: [22.5941, 88.2676] },
            { name: 'Dalhousie Square', time: '08:15', coords: [22.5596, 88.3639] },
            { name: 'Park Street', time: '08:30', coords: [22.5548, 88.3679] },
            { name: 'Esplanade', time: '08:45', coords: [22.5568, 88.3749] }
        ],
        isRunning: false,
        currentStop: 0,
        marker: null,
        polyline: null
    },
    {
        id: 2,
        name: 'Salt Lake Express',
        route: 'Sealdah → Salt Lake',
        color: '#4ecdc4',
        icon: '<i class="fas fa-bus" style="color: #4ecdc4;"></i>',
        stops: [
            { name: 'Sealdah Station', time: '09:00', coords: [22.5624, 88.3603] },
            { name: 'Maidan', time: '09:20', coords: [22.5630, 88.3584] },
            { name: 'Bidhannagar', time: '09:40', coords: [22.5988, 88.4064] },
            { name: 'Salt Lake Sector V', time: '10:00', coords: [22.5577, 88.4433] }
        ],
        isRunning: false,
        currentStop: 0,
        marker: null,
        polyline: null
    },
    {
        id: 3,
        name: 'Kolkata City Bus',
        route: 'Rabindra Sarovar → South City',
        color: '#ffe66d',
        icon: '<i class="fas fa-bus" style="color: #ffe66d;"></i>',
        stops: [
            { name: 'Rabindra Sarovar', time: '07:30', coords: [22.5485, 88.3589] },
            { name: 'Gariahat', time: '07:50', coords: [22.5239, 88.3811] },
            { name: 'Ballygunge', time: '08:10', coords: [22.5164, 88.3869] },
            { name: 'South City', time: '08:30', coords: [22.5055, 88.3923] }
        ],
        isRunning: false,
        currentStop: 0,
        marker: null,
        polyline: null
    }
];

let currentFilter = 'all';
let selectedBus = null;

// Initialize map with bus markers
function initializeMap() {
    buses.forEach(bus => {
        const startCoords = bus.stops[0].coords;
        
        // Draw polyline for route
        bus.polyline = L.polyline(
            bus.stops.map(stop => stop.coords),
            { 
                color: bus.color, 
                weight: 3, 
                opacity: 0.5,
                dashArray: '5, 5'
            }
        ).addTo(map);

        // Create bus marker
        bus.marker = L.circleMarker(startCoords, {
            radius: 10,
            fillColor: bus.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);

        // Bind popup
        bus.marker.bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="margin: 0; color: ${bus.color};">${bus.name}</h4>
                <p style="margin: 5px 0; font-size: 12px;">
                    <strong>Route:</strong> ${bus.route}
                </p>
                <p style="margin: 5px 0; font-size: 12px;">
                    <strong>Current:</strong> ${bus.stops[bus.currentStop].name}
                </p>
                <p style="margin: 5px 0; font-size: 12px;">
                    <strong>Status:</strong> 
                    <span style="color: ${bus.isRunning ? '#00d400' : '#666'};">
                        ${bus.isRunning ? '● Running' : '● Stopped'}
                    </span>
                </p>
            </div>
        `);

        bus.marker.on('click', () => selectBus(bus.id));
    });
}

// Select a bus
function selectBus(busId) {
    selectedBus = busId;
    updateBusList();
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateUserMarker();
                updateLocationDisplay();
            },
            function() {
                userLocation = { lat: 22.5726, lng: 88.3639 };
                updateLocationDisplay();
            }
        );
    } else {
        userLocation = { lat: 22.5726, lng: 88.3639 };
        updateLocationDisplay();
    }
}

// Update user marker on map
function updateUserMarker() {
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: '#00d4ff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    userMarker.bindPopup('📍 Your Location');
}

// Update location display
function updateLocationDisplay() {
    const text = `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    document.getElementById('userLocationText').textContent = text;
}

// Locate user button
function locateUser() {
    if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 14);
    }
}

// Zoom controls
function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

// Start bus movement
function startBus(busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus && !bus.isRunning) {
        bus.isRunning = true;
        moveBuses();
        updateBusList();
        updateActiveBusCount();
    }
}

// Stop bus
function stopBus(busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
        bus.isRunning = false;
        updateBusList();
        updateActiveBusCount();
    }
}

// Start all buses
function startAllBuses() {
    buses.forEach(bus => {
        bus.isRunning = true;
    });
    moveBuses();
    updateBusList();
    updateActiveBusCount();
}

// Stop all buses
function stopAllBuses() {
    buses.forEach(bus => {
        bus.isRunning = false;
    });
    clearInterval(moveBusInterval);
    updateBusList();
    updateActiveBusCount();
}

let moveBusInterval;

// Move buses
function moveBuses() {
    clearInterval(moveBusInterval);
    moveBusInterval = setInterval(() => {
        buses.forEach(bus => {
            if (bus.isRunning) {
                bus.currentStop = (bus.currentStop + 1) % bus.stops.length;
                const coords = bus.stops[bus.currentStop].coords;
                bus.marker.setLatLng(coords);
            }
        });
        updateBusList();
    }, 3000);
}

// Filter buses
function filterBuses(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    updateBusList();
}

// Update active bus count
function updateActiveBusCount() {
    const count = buses.filter(b => b.isRunning).length;
    document.getElementById('activeBusCount').textContent = count;
}

// Update bus list in sidebar
function updateBusList() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const busList = document.getElementById('busList');
    busList.innerHTML = '';

    buses.forEach(bus => {
        // Apply filters
        if (currentFilter === 'running' && !bus.isRunning) return;
        if (currentFilter === 'stopped' && bus.isRunning) return;

        // Apply search
        if (searchValue && !bus.name.toLowerCase().includes(searchValue) && 
            !bus.route.toLowerCase().includes(searchValue)) {
            return;
        }

        const currentStop = bus.stops[bus.currentStop];
        const nextStop = bus.stops[(bus.currentStop + 1) % bus.stops.length];

        const card = document.createElement('div');
        card.className = `bus-card ${selectedBus === bus.id ? 'active' : ''}`;
        card.onclick = () => selectBus(bus.id);

        card.innerHTML = `
            <div class="bus-name">
                <span class="live-dot" style="display: ${bus.isRunning ? 'inline-block' : 'none'};"></span>
                ${bus.name}
            </div>
            <div class="bus-location">
                📍 ${bus.route}
            </div>
            <div class="bus-location">
                🚏 Currently: ${currentStop.name}
            </div>
            <div class="bus-location">
                🎯 Next: ${nextStop.name} (${nextStop.time})
            </div>
            <div class="bus-status">
                <span class="status-badge ${bus.isRunning ? 'status-live' : 'status-offline'}">
                    ${bus.isRunning ? '🔴 LIVE' : '⚫ OFFLINE'}
                </span>
            </div>
            <div class="time-display">
                ⏰ Updated now
            </div>
        `;

        busList.appendChild(card);
    });
}

// Update live time
function updateLiveTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('liveTime').textContent = timeString;
}

// Search functionality
document.getElementById('searchInput').addEventListener('keyup', updateBusList);

// Initialize everything on page load
window.addEventListener('load', () => {
    initializeMap();
    getUserLocation();
    updateBusList();
    updateActiveBusCount();
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
});

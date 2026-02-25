const API_URL = 'http://localhost:3000/api/bus';

// Initialize Map - Kolkata
var map = L.map('map').setView([22.5726, 88.3639], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// User location marker
var userMarker = null;
var userLocationControl = null;

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Add user marker to map
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                userMarker = L.circleMarker([lat, lon], {
                    radius: 8,
                    fillColor: '#00d4ff',
                    color: '#00d4ff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);
                
                userMarker.bindPopup('<strong>📍 Your Location</strong>');
                
                // Pan map to user
                map.setView([lat, lon], 13);
                
                // Update in details
                updateUserLocationDisplay(lat, lon);
            },
            function(error) {
                console.log('Location access denied. Using default location.');
                updateUserLocationDisplay(22.5726, 88.3639);
            }
        );
    }
}

// Bus timetable data - Kolkata Buses
var buses = [
    {
        id: 1,
        name: 'Howrah Metro Bus',
        color: '#ff6b6b',
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
        color: '#4ecdc4',
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
        color: '#ffe66d',
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

let updateInterval;

// Display current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Update user location display
function updateUserLocationDisplay(lat, lon) {
    const locationDiv = document.getElementById('userLocation');
    if (locationDiv) {
        locationDiv.innerHTML = `
            <p><strong>📍 Your Current Location</strong></p>
            <p>Latitude: ${lat.toFixed(4)}</p>
            <p>Longitude: ${lon.toFixed(4)}</p>
        `;
    }
}

// Initialize map markers for all buses
function initializeMapMarkers() {
    buses.forEach(bus => {
        const startCoords = bus.stops[0].coords;
        
        bus.polyline = L.polyline(
            bus.stops.map(stop => stop.coords),
            { color: bus.color, weight: 2, opacity: 0.7 }
        ).addTo(map);

        bus.marker = L.marker(startCoords, {
            title: bus.name,
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        bus.marker.bindPopup(`<strong>${bus.name}</strong>`);
    });
}

// Update bus positions on map
function updateBusPositions() {
    buses.forEach(bus => {
        if (bus.isRunning && bus.marker) {
            const currentCoords = bus.stops[bus.currentStop].coords;
            bus.marker.setLatLng(currentCoords);
        }
    });
}

// Start a specific bus
function startBus(busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
        bus.isRunning = true;
        bus.currentStop = 0;
        updateTimetable();
        
        if (!updateInterval) {
            updateInterval = setInterval(() => {
                buses.forEach(bus => {
                    if (bus.isRunning) {
                        bus.currentStop = (bus.currentStop + 1) % bus.stops.length;
                    }
                });
                updateBusPositions();
                updateTimetable();
            }, 3000);
        }
    }
}

// Stop a specific bus
function stopBus(busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
        bus.isRunning = false;
        updateTimetable();
    }
}

// Start all buses
function startAllBuses() {
    buses.forEach(bus => {
        bus.isRunning = true;
        bus.currentStop = 0;
    });

    updateInterval = setInterval(() => {
        buses.forEach(bus => {
            if (bus.isRunning) {
                bus.currentStop = (bus.currentStop + 1) % bus.stops.length;
            }
        });
        updateBusPositions();
        updateTimetable();
    }, 3000);

    updateTimetable();
}

// Stop all buses
function stopAllBuses() {
    buses.forEach(bus => {
        bus.isRunning = false;
    });
    clearInterval(updateInterval);
    updateTimetable();
}

// Refresh timetable display
function refreshTimetable() {
    updateTimetable();
}

// Update timetable UI
function updateTimetable() {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    buses.forEach(bus => {
        const currentStop = bus.stops[bus.currentStop];
        const nextStop = bus.stops[(bus.currentStop + 1) % bus.stops.length];

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${bus.name}</strong></td>
            <td class="location">${currentStop.name}</td>
            <td class="time">${nextStop.time}</td>
            <td class="status">
                <span class="status-badge ${bus.isRunning ? 'status-running' : 'status-stopped'}">
                    ${bus.isRunning ? '● Running' : '● Stopped'}
                </span>
            </td>
            <td>
                <button onclick="startBus(${bus.id})" ${bus.isRunning ? 'disabled' : ''}>
                    Start
                </button>
                <button onclick="stopBus(${bus.id})" ${!bus.isRunning ? 'disabled' : ''}>
                    Stop
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateBusDetails();
    updateBusCount();
}

// Update bus count
function updateBusCount() {
    const runningBuses = buses.filter(b => b.isRunning).length;
    const countElement = document.getElementById('busCount');
    if (countElement) {
        countElement.textContent = runningBuses;
    }
}

// Update bus details panel
function updateBusDetails() {
    const busDetailsDiv = document.getElementById('busDetails');
    busDetailsDiv.innerHTML = '';

    buses.forEach(bus => {
        const currentStop = bus.stops[bus.currentStop];
        const nextStop = bus.stops[(bus.currentStop + 1) % bus.stops.length];
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        const details = document.createElement('div');
        details.className = 'bus-details';
        details.innerHTML = `
            <p><strong>${bus.name}</strong></p>
            <p>📍 Current: ${currentStop.name}</p>
            <p>🎯 Next: ${nextStop.name}</p>
            <p>⏰ Next Arrival: ${nextStop.time}</p>
            <p>🕐 Current Time: ${timeString}</p>
            <span class="status-badge ${bus.isRunning ? 'status-running' : 'status-stopped'}">
                ${bus.isRunning ? '🚌 Live' : '⏸️ Offline'}
            </span>
        `;
        busDetailsDiv.appendChild(details);
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    initializeMapMarkers();
    updateTimetable();
    getUserLocation();
    updateTime();
    
    // Update time every second
    setInterval(updateTime, 1000);
});

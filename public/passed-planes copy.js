const LIVE_PLANE_DATA_URL = `http://${location.hostname}:8080/data.json`;
const PAST_PLANE_DATA_URL = 'passing-planes.log';
const POLLING_INTERVAL = 2 * 1000; // 2s

// reference to the map and set its default view
const map = L.map('map').setView([mapViewLat, mapViewLon], 10);

// these are for the live planes on the map
const livePlaneMarkers = new Map();

// set the tile server
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// show data of planes that have passed
fetch(PAST_PLANE_DATA_URL)
    .then(plotPlanes)
    .catch(err => console.log(`[${err.lineNumber},${err.columnNumber}]`, err.message));

async function plotPlanes(response) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    const now = Date.now();
    const planeData = await response.text();
    const planeDataLines = planeData.split('\n');
    planeDataLines
        .map(line => line.split(','))
        .filter(planeData => planeData.length >= 8)
        .map(arr => ({
            hex: arr[1],
            flight: arr[2],
            time: arr[3],
            lat: arr[4],
            lon: arr[5],
            distance: arr[6],
            altitude: arr[7],
            track: arr[8],
            measurements: arr[9],
            opacity: 1 - ((now - arr[3]) / CUTOFF_TIME)
        }))
        .filter(({ time }) => now - time < CUTOFF_TIME)
        .forEach(getMarker);
}

function getMarker(plane) {
    const marker = L.marker([plane.lat, plane.lon], { icon: getIcon(plane.altitude, plane.track) }).addTo(map);
    marker.on('mouseover', () => marker.setZIndexOffset(10000));
    marker.on('mouseout', () => marker.setZIndexOffset(0));
    marker.bindPopup(getPopupText(plane));
    marker.setOpacity(plane.opacity);
    return marker;
}

function getPopupText(plane) {
    return `hex: ${plane.hex}<br>flight: ${plane.flight}<br>time: ${plane.time}<br>distance: ${plane.distance} km<br>altitude: ${plane.altitude} ft<br>track: ${plane.track}<br>seen #: ${plane.measurements}`;
}

function getIcon(altitude, track, live = false) {
    const rotation = -45 + Number(track); // plane emoji is rotated 45 deg on most systems
    const iconClass = live ? 'plane-icon-live' : 'plane-icon';
    const html = `<div class="${iconClass}" style="transform: rotate(${rotation}deg); background-color: ${getAltitudeColor(altitude)};">✈️</div>`;
    return L.divIcon({ html, className: '', iconSize: [30, 30] });
}

function getAltitudeColor(altitude) {
    const maximumAltitude = 40000;
    const relativeAltitude = Math.min(Number(altitude) / maximumAltitude, 1);

    const hue = 50 + Math.floor(310 * relativeAltitude); // between yellow (50) and red (360)
    return `hsl(${hue}, 100%, 50%)`;
}

function fetchLivePlanes(planes) {
    // get and process life plane data from dump1090
    fetch(LIVE_PLANE_DATA_URL)
        .then(plotLiveData)
        .catch(err => console.log(`[${err.lineNumber},${err.columnNumber}]`, err.message));
}

async function plotLiveData(response) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    // update live data
    const planeDataArr = await response.json();
    planeDataArr.forEach(plotLivePlanes);

    // remove stale data
    livePlaneMarkers.keys().forEach(hex => {
        if (!planeDataArr.find(plane => plane.hex === hex)) {
            livePlaneMarkers.get(hex).remove();
            livePlaneMarkers.delete(hex);
        }
    });
}

const timestamp = (epoch) => new Date(epoch).toISOString();

function plotLivePlanes(plane) {
    plane.distance = ''; // will be undefined otherwise
    plane.time = new Date().toISOString();

    if (!livePlaneMarkers.has(plane.hex)) {
        livePlaneMarkers.set(plane.hex, getMarker(plane));
    }

    const marker = livePlaneMarkers.get(plane.hex);
    marker.setIcon(getIcon(plane.altitude, plane.track, true));
    marker.setLatLng([plane.lat, plane.lon]);
    marker.setZIndexOffset(20000);
    marker.setPopupContent(getPopupText(plane));
}

setInterval(fetchLivePlanes, POLLING_INTERVAL);

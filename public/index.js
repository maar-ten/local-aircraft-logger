import { LeafletMap } from './leaflet.js';
import { plotPastPlanes } from './passed-planes.js';
import { plotLivePlanes } from './live-planes.js';

const PAST_PLANE_DATA_URL = 'passing-planes.log';
const LIVE_PLANE_DATA_URL = `http://${location.hostname}:8080/data.json`;
const POLLING_INTERVAL = 2 * 1000; // 2s

const queryString = new URLSearchParams(window.location.search);
const mapViewLat = queryString.get('lat') ?? 52;
const mapViewLon = queryString.get('lon') ?? 4;

const map = new LeafletMap('map', mapViewLat, mapViewLon);

function logError(err) {
  console.log(`[${err.fileName}:${err.lineNumber}:${err.columnNumber}]`, err.message)
}

fetch(PAST_PLANE_DATA_URL)
    .then(response => plotPastPlanes(response, map.map))
    .catch(logError);

function fetchLivePlanes() {
    fetch(LIVE_PLANE_DATA_URL)
        .then(response => plotLivePlanes(response, map.map))
        .catch(logError);
}

setInterval(fetchLivePlanes, POLLING_INTERVAL);
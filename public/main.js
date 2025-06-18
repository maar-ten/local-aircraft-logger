import { LeafletMap } from './leaflet.js';
import { plotPastAircrafts } from './past-aircrafts.js';
import { plotPastAircraftPaths } from './past-aircraft-paths.js';
import { plotLiveAircrafts } from './live-aircrafts.js';

const PAST_AIRCRAFT_DATA_URL = 'past-aircrafts.log';
const PAST_AIRCRAFT_PATH_DATA_URL = 'low-altitude-aircrafts.log'
const LIVE_AIRCRAFT_DATA_URL = `http://${location.hostname}:8080/data.json`;
const POLLING_INTERVAL = 2 * 1000; // 2s

const queryString = new URLSearchParams(window.location.search);
const mapViewLat = queryString.get('lat') ?? 52;
const mapViewLon = queryString.get('lon') ?? 4;

const map = new LeafletMap('map', mapViewLat, mapViewLon);

function logError(err) {
  console.log(`[${err.fileName}:${err.lineNumber}:${err.columnNumber}]`, err.message)
}

fetch(PAST_AIRCRAFT_DATA_URL)
    .then(response => plotPastAircrafts(response, map))
    .catch(logError);

fetch(PAST_AIRCRAFT_PATH_DATA_URL)
    .then(response => plotPastAircraftPaths(response, map))
    .catch(logError);

function fetchLiveAircrafts() {
    fetch(LIVE_AIRCRAFT_DATA_URL)
        .then(response => plotLiveAircrafts(response, map))
        .catch(logError);
}

setInterval(fetchLiveAircrafts, POLLING_INTERVAL);
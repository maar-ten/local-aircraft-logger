const fs = require('fs')

const URL = 'http://172.17.0.1:8080/data.json';
// const URL = 'http://localhost:8080/data.json';
const POLLING_INTERVAL = 2 * 1000; // 2s
const CACHE_EVICTION_TIME = 2 * 60 * 1000; // 2 minutes
const LOW_ALTITUDE_CUTOFF = 1500 // in feet
const LAT_HOME = Number(process.env.LAT_HOME) || 52;
const LON_HOME = Number(process.env.LON_HOME) || 4;
const TZ = process.env.TZ || 'UTC';
const R = 6371; // Radius of the earth in km

console.log('Lat/lon of home are set to:', [LAT_HOME, LON_HOME]);
console.log('Timezone set to:', TZ);
console.log(`Fetching data from: ${URL} every ${POLLING_INTERVAL / 1000} sec.`);

// Locale of Sweden (sv) looks similar to ISO
const format = (epoch) => new Date(epoch).toLocaleString('sv', {timezone: TZ}).replace(' ', 'T');

const aircrafts = new Map();

const logger = fs.createWriteStream('./public/past-aircrafts.log', {
  flags: 'a' // append data to the file
});

const lowAltitudeLogger = fs.createWriteStream('./public/low-altitude-aircrafts.log', {
  flags: 'a' // append data to the file
});

function monitorAircrafts() {
  // get and process aircraft data from dump1090
  fetch(URL)
    .then(processResponse)
    .catch(err => console.log(err.message));

  const expiredAircrafts = getExpiredAircrafts();
  logAircrafts(expiredAircrafts);

  // remove expired aircrafts
  expiredAircrafts.forEach(aircraft => aircrafts.delete(aircraft.hex));
}
setInterval(monitorAircrafts, POLLING_INTERVAL);

async function processResponse(response) {
  if (!response.ok) {
    throw new Error(`Response not OK: ${response.status}`);
  }

  const aircraftDataArr = await response.json();
  aircraftDataArr.forEach(updateAircrafts);
}

function updateAircrafts(aircraft) {
  if (aircrafts.has(aircraft.hex)) {
    aircrafts.get(aircraft.hex).update(aircraft);
    return;
  }

  const newAircraft = new Aircraft(aircraft);
  aircrafts.set(newAircraft.hex, newAircraft);
}

function getExpiredAircrafts() {
  const now = Date.now();
  return aircrafts.values()
    .toArray()
    .filter(aircraft => now - aircraft.lastSeen >= CACHE_EVICTION_TIME);
}

function logAircrafts(aircrafts) {
  aircrafts.forEach(aircraft => {
    logger.write(`${aircraft}\n`);

    if (aircraft.distanceAircraft.altitude <= LOW_ALTITUDE_CUTOFF) {
      lowAltitudeLogger.write(`${serializePath(aircraft)}\n`);
    }
});
}

function serializePath(aircraft) {
  // use semi-colons because the path array already uses commas
  return `${format(aircraft.lastSeen)};${aircraft.hex};${aircraft.path}`;
}

function getDistance({lat, lon}) {
  const dLat = toRad(LAT_HOME - lat);
  const dLon = toRad(LON_HOME - lon);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(LAT_HOME)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

function toRad(angle) {
  return (angle * Math.PI) / 180;
}

class Aircraft {
  hex;
  aircraft;
  path = [];
  lastSeen;
  distanceAircraft;
  distance;
  distanceTime;

  constructor(aircraft) {
    const now = Date.now();

    this.hex = aircraft.hex;
    this.aircraft = aircraft;
    this.path.push([aircraft.lat, aircraft.lon]);
    this.distance = getDistance(aircraft);
    this.distanceTime = now;
    this.distanceAircraft = aircraft;
    this.lastSeen = now;
  }

  update(aircraft) {
    const distance = getDistance(aircraft);
    const now = Date.now();

    if (distance > this.distance) {
      this.distance = distance;
      this.distanceTime = now;
      this.distanceAircraft = aircraft;
    }

    this.lastSeen = now;

    const coords = [aircraft.lat, aircraft.lon];
    if (!this.equalLastCoords(coords)) {
      this.path.push(coords);
    }
  }

  equalLastCoords(coords) {
    const lastCoords = this.path[this.path.length - 1];
    return lastCoords[0] === coords[0] && lastCoords[1] === coords[1];
  }

  toString() {
    return [
      format(this.lastSeen),
      this.hex,
      this.distanceAircraft.flight.trim(),
      format(this.distanceTime),
      this.distanceAircraft.lat,
      this.distanceAircraft.lon,
      this.distance.toFixed(1),
      this.distanceAircraft.altitude,
      this.distanceAircraft.speed,
      this.distanceAircraft.track,
      this.path.length
    ].toString();
  }
}

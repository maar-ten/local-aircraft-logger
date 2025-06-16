const fs = require('fs')

const URL = 'http://172.17.0.1:8080/data.json';
// const URL = 'http://localhost:8080/data.json';
const POLLING_INTERVAL = 5 * 1000; // 5s
const CACHE_EVICTION_TIME = 2 * 60 * 1000; // 2 minutes
const LAT_HOME = Number(process.env.LAT_HOME) || 52;
const LON_HOME = Number(process.env.LON_HOME) || 4;
const TZ = process.env.TZ || 'UTC';
const R = 6371; // Radius of the earth in km

console.log('Lat/lon of home are set to:', [LAT_HOME, LON_HOME]);
console.log('Timezone set to:', TZ);
console.log(`Fetching data from: ${URL} every ${POLLING_INTERVAL / 1000} sec.`);

// Locale of Sweden (sv) looks similar to ISO
const format = (datetime) => datetime.toLocaleString('sv', {timezone: TZ}).replace(' ', 'T');

const planes = new Map();

const logger = fs.createWriteStream('./public/passing-planes.log', {
  flags: 'a' // append data to the file
});

// const lowAltitudeLogger = fs.createWriteStream('./public/low-altitude-planes.log', {
//   flags: 'a' // append data to the file
// });

function logPlanesNearby() {
  // get and process plane data from dump1090
  fetch(URL)
    .then(processResponse)
    .catch(err => console.log(err.message));

  // write data to log of planes that have left the local area
  const now = Date.now(); // millis since epoch
  const expiredPlanes = planes.values()
    .toArray()
    .filter(plane => now - plane.lastSeen >= CACHE_EVICTION_TIME);

  logPlanes(expiredPlanes);

  // clean up of expired planes
  expiredPlanes.forEach(plane => planes.delete(plane.hex));
}
setInterval(logPlanesNearby, POLLING_INTERVAL);

async function processResponse(response) {
  if (!response.ok) {
    throw new Error(`Response not OK: ${response.status}`);
  }

  const planeDataArr = await response.json();
  planeDataArr.forEach(updatePlanes);
}

function updatePlanes(plane) {
  if (planes.has(plane.hex)) {
    planes.get(plane.hex).update(plane);
  } else {
    const newPlane = new Plane(plane);
    planes.set(newPlane.hex, newPlane);
  }
}

function logPlanes(planes) {
  planes.forEach(plane => {
    logger.write(`${plane}\n`);
});
}

function getDistance({lat, lon}) {
  const dLat = toRad(LAT_HOME - lat);
  const dLon = toRad(LON_HOME - lon);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(LAT_HOME)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(angle) {
  return (angle * Math.PI) / 180;
}

class Plane {
  hex;
  plane;
  path = [];
  lastSeen;
  closestDistancePlane;
  closestDistance;
  closestDistanceTime;

  constructor(plane) {
    const now = Date.now();

    this.hex = plane.hex;
    this.plane = plane;
    this.path.push([plane.lat, plane.lon]);
    this.closestDistance = getDistance(plane);
    this.closestDistanceTime = now;
    this.closestDistancePlane = plane;
    this.lastSeen = now;
  }

  update(plane) {
    const distance = getDistance(plane);
    const now = Date.now();

    if (distance < this.closestDistance) {
      this.closestDistance = distance;
      this.closestDistanceTime = now;
      this.closestDistancePlane = plane;
    }

    this.lastSeen = now;

    const coords = [plane.lat, plane.lon];
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
      this.closestDistancePlane.flight.trim(),
      format(this.closestDistanceTime),
      this.closestDistancePlane.lat,
      this.closestDistancePlane.lon,
      this.closestDistance.toFixed(1),
      this.closestDistancePlane.altitude,
      this.closestDistancePlane.speed,
      this.closestDistancePlane.track,
      this.path.length
    ].toString();
  }
}

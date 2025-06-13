const fs = require('fs')

const URL = 'http://172.17.0.1:8080/data.json';
// const URL = 'http://localhost:8080/data.json';
const POLLING_INTERVAL = 5 * 1000; // 5s
const CACHE_EVICTION_TIME = 2 * 60 * 1000; // 2 minutes
const LAT_HOME = Number(process.env.LAT_HOME) || 52;
const LON_HOME = Number(process.env.LON_HOME) || 4;
const R = 6371; // Radius of the earth in km

console.log('Lat/lon of home are set to:', [LAT_HOME, LON_HOME]);
console.log(`Fetching data from: ${URL} every ${POLLING_INTERVAL / 1000} sec.`);

const planes = new Map();

const logger = fs.createWriteStream('passing-planes.log', {
  flags: 'a' // append data to the file
})

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

async function processResponse(response) {
  if (!response.ok) {
    throw new Error(`Response not OK: ${response.status}`);
  }

  const planeDataArr = await response.json();
  planeDataArr.forEach(updatePlanes);
}

function updatePlanes(plane) {
  const currentDistance = getDistance(plane);
  const cachedPlane = planes.get(plane.hex);
  const now = Date.now();

  if (cachedPlane && cachedPlane.closestDistance < currentDistance) {
    // plane is further away so just update the last seen time
    planes.set(plane.hex, {
      ...cachedPlane,
      measurements: ++cachedPlane.measurements,
      lastSeen: now
    });
    return;
  }

  // create a new set of closest parameters for this plane
  planes.set(plane.hex, {
    ...plane,
    closestDistance: currentDistance,
    closestDistanceTime: now,
    closestDistanceLat: plane.lat,
    closestDistanceLon: plane.lon,
    closestDistanceAltitude: plane.altitude,
    closestDistanceTrack: plane.track,
    measurements: cachedPlane ? ++cachedPlane.measurements : 1,
    lastSeen: now,
  });
}

function logPlanes(planes) {
  planes.forEach(plane => logger.write(`${toString(plane)}\n`));
}

function toString(plane) {
  const timestamp = (epoch) => new Date(epoch).toISOString();
  return [
    timestamp(plane.lastSeen),
    plane.hex,
    plane.flight.trim(),
    timestamp(plane.closestDistanceTime),
    plane.closestDistanceLat,
    plane.closestDistanceLon,
    plane.closestDistance.toFixed(1),
    plane.closestDistanceAltitude,
    plane.closestDistanceTrack,
    plane.measurements
  ].toString();
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

setInterval(logPlanesNearby, POLLING_INTERVAL);

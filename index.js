const fs = require('fs')

// const URL = 'http://172.17.0.1:8080/data.json';
const URL = 'http://localhost:8080/data.json';
const POLLING_INTERVAL = 5 * 1000; // 5s
const LAT_HOME = Number(process.env.LAT_HOME) || 52;
const LON_HOME = Number(process.env.LON_HOME) || 4;
const R = 6371; // Radius of the earth in km

console.log('Lat/lon of home are set to:', [LAT_HOME, LON_HOME]);
console.log(`Fetching data from: ${URL} every ${POLLING_INTERVAL / 1000} sec.`);
console.log(Math.atan2);

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
  const expirationTime = 2 * 60 * 1000; // 2 minutes
  const expiredPlanes = planes.values()
    .filter(plane => now - plane.lastSeen >= expirationTime);

  logPlanes(expiredPlanes);

  // clean up of expired planes
  expiredPlanes.forEach(plane => planes.delete(plane.hex));

  console.log(planes.values().toArray());
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
    // just update the last seen time
    planes.set(plane.hex, {
      ...plane,
      measurements: cachedPlane.measurements++,
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
    measurements: cachedPlane ? cachedPlane.measurements++ : 1,
    lastSeen: now,
  });
}

function logPlanes(planes) {
  const timestamp = (epoch) => new Date(epoch).toISOString();
  planes.forEach(plane => logger.write(`${timestamp(plane.lastSeen)},${plane.hex},${plane.flight.trim()},${plane.closestDistance}, ${plane.measurements}`));
}

function getDistance(lat, lon) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(LAT_HOME - lat);
  const dLon = toRad(LON_HOME - lon);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(LAT_HOME)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

setInterval(logPlanesNearby, POLLING_INTERVAL);

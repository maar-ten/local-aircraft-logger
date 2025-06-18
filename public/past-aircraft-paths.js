import { LayerGroups } from './leaflet.js';

export async function plotPastAircraftPaths(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    const now = Date.now();
    const aircraftData = await response.text();
    const aircraftDataLines = aircraftData.split('\n');
    aircraftDataLines
        .map(line => line.split(';'))
        .filter(aircraftData => aircraftData.length >= 3)
        .map(arr => ({
            time: arr[0],
            hex: arr[1],
            path: arr[2],
        }))
        .map(({path}) => parsePath(path))
        .forEach(points => map.addPathPoints(points, LayerGroups.LOW_FLYING_AIRCRAFTS));
}

// combines every 1st and 2nd element into an array of arrays, so [1, 2, 3, 4] becomes [[1, 2], [3, 4]]
function parsePath(pathStr) {
  const path = [];
  const pathPoints = pathStr.split(',');

  for(let i = 0; i < pathPoints.length / 2; i += 2) {
    path.push([pathPoints[i], pathPoints[i + 1]]);
  }

  return path;
}
import { addPathPoints } from './leaflet.js';

const CUTOFF_TIME = 1 * 60 * 60 * 1000; // 1h 

export async function plotPastPlanePaths(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    const now = Date.now();
    const planeData = await response.text();
    const planeDataLines = planeData.split('\n');
    planeDataLines
        .map(line => line.split(';'))
        .filter(planeData => planeData.length >= 3)
        .map(arr => ({
            time: arr[0],
            hex: arr[1],
            path: parsePath(arr[2]),
            opacity: 1 - ((now - new Date(arr[3])) / CUTOFF_TIME)
        }))
        .filter(({ time }) => now - new Date(time) < CUTOFF_TIME)
        .map(({path}) => parsePath(path))
        .forEach(points => addPathPoints(points, map));
}

// combines every 1st and 2nd element into an array of arrays, so [1, 2, 3, 4] becomes [[1, 2], [3, 4]]
function parsePath(pathStr) {
  const path = [];
  const pathPoints = pathStr.split(',');

  for(i = 0; i < pathPoints.length / 2; i += 2) {
    path.push([pathPoints[i], pathPoints[i + 1]]);
  }

  return path;
}
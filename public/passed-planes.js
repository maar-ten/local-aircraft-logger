import { addMarker } from './leaflet.js';

const CUTOFF_TIME = 1 * 60 * 60 * 1000; // 1h 

export async function plotPastPlanes(response, map) {
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
            opacity: 1 - ((now - new Date(arr[3])) / CUTOFF_TIME)
        }))
        .filter(({ time }) => now - new Date(time) < CUTOFF_TIME)
        .forEach(plane => addMarker(plane, map));
}

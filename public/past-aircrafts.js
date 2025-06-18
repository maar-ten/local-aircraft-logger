import { LayerGroups } from './leaflet.js';

const CUTOFF_TIME = 1 * 60 * 60 * 1000; // 1h 
const CUTOFF_HEIGHT = 1500 // feet

export async function plotPastAircrafts(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    const now = Date.now();
    const aircraftData = await response.text();
    const aircraftDataLines = aircraftData.split('\n');
    aircraftDataLines
        .map(line => line.split(','))
        .filter(aircraftData => aircraftData.length >= 8)
        .map(arr => ({
            hex: arr[1],
            flight: arr[2],
            time: arr[3],
            lat: arr[4],
            lon: arr[5],
            distance: arr[6],
            altitude: arr[7],
            speed: arr[8],
            track: arr[9],
            measurements: arr[10],
        }))
        .forEach(aircraft => map.addMarker(aircraft, LayerGroups.OTHER_PAST_AIRCRAFTS));
}

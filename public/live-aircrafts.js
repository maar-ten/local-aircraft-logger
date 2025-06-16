import { addMarker, addPath, updateMarker, updatePath } from './leaflet.js';

const TZ = 'UTC'; //needs to be set in the URL

class Aircraft {
    hex;
    marker;
    path;

    constructor(aircraft, map) {
        this.hex = aircraft.hex;
        this.marker = addMarker(aircraft, map);
        this.path = addPath(aircraft, map);
    }

    update(aircraft) {
      aircraft.measurements = this.updates() + 1;
      updateMarker(this.marker, aircraft);
      updatePath(this.path, aircraft);
    }

    remove() {
        this.marker.remove();
        this.path.remove();
    }

    updates() {
        return this.path.getLatLngs().length;
    }
}

const aircraftCache = new Map();

export async function plotLiveAircrafts(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    // update live data
    const aircraftDataArr = await response.json();
    aircraftDataArr.forEach(aircraft => plotAircrafts(aircraft, map));

    // remove stale data
    aircraftCache.keys().forEach(hex => {
        if (!aircraftDataArr.find(aircraft => aircraft.hex === hex)) {
            aircraftCache.get(hex).remove(); // remove from map
            aircraftCache.delete(hex); // remove from cache
        }
    });
}

const format = (epoch) => new Date(epoch).toLocaleString('sv', {timezone: TZ}).replace(' ', 'T');

function plotAircrafts(aircraft, map) {
    aircraft.distance = ''; // will be undefined otherwise
    aircraft.time = format(Date.now());
    aircraft.opacity = 1;

    if (aircraftCache.has(aircraft.hex)) {
        const cachedAircraft = aircraftCache.get(aircraft.hex);
        cachedAircraft.update(aircraft);
        return;
    }

    aircraftCache.set(aircraft.hex, new Aircraft(aircraft, map));
}

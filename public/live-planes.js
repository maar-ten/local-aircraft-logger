import { addMarker, addPath, updateMarker, updatePath } from './leaflet.js';

class Plane {
    hex;
    marker;
    path;

    constructor(plane, map) {
        this.hex = plane.hex;
        this.marker = addMarker(plane, map);
        this.path = addPath(plane, map);
    }

    update(plane) {
      plane.measurements = this.updates() + 1;
      updateMarker(this.marker, plane);
      updatePath(this.path, plane);
    }

    remove() {
        this.marker.remove();
        this.path.remove();
    }

    updates() {
        return this.path.getLatLngs().length;
    }
}

const livePlaneCache = new Map();

export async function plotLivePlanes(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    // update live data
    const planeDataArr = await response.json();
    planeDataArr.forEach(plane => plotPlanes(plane, map));

    // remove stale data
    livePlaneCache.keys().forEach(hex => {
        if (!planeDataArr.find(plane => plane.hex === hex)) {
            livePlaneCache.get(hex).remove(); // remove from map
            livePlaneCache.delete(hex); // remove from cache
        }
    });
}

const timestamp = (epoch) => new Date(epoch).toISOString();

function plotPlanes(plane, map) {
    plane.distance = ''; // will be undefined otherwise
    plane.time = new Date().toISOString();
    plane.opacity = 1;

    if (livePlaneCache.has(plane.hex)) {
        const cachedPlane = livePlaneCache.get(plane.hex);
        cachedPlane.update(plane);
        return;
    }

    livePlaneCache.set(plane.hex, new Plane(plane, map));
}

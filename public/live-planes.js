import { addMarker, getIcon, getPopupText } from './leaflet.js';

class Plane {
    hex;    // unique plane code
    marker; // reference to the leaflet marker
    path;   // array of 1090plane

    constructor(plane, marker) {
        this.hex = plane.hex;
        this.marker = marker;
        this.path = [{
            ...plane,
            time: Date.now()
        }];
    }
}

const livePlaneMarkers = new Map();

export async function plotLivePlanes(response, map) {
    if (!response.ok) {
        throw new Error(`Response not OK: ${response.status}`);
    }

    // update live data
    const planeDataArr = await response.json();
    planeDataArr.forEach(plane => plotPlanes(plane, map));

    // remove stale data
    livePlaneMarkers.keys().forEach(hex => {
        if (!planeDataArr.find(plane => plane.hex === hex)) {
            livePlaneMarkers.get(hex).marker.remove();
            livePlaneMarkers.delete(hex);
        }
    });
}

const timestamp = (epoch) => new Date(epoch).toISOString();

function plotPlanes(plane, map) {
    plane.distance = ''; // will be undefined otherwise
    plane.time = new Date().toISOString();
    plane.opacity = 1;

    if (livePlaneMarkers.has(plane.hex)) {
        const cachedPlane = livePlaneMarkers.get(plane.hex);
        cachedPlane.path.push(plane);
        updateMarker(cachedPlane);
        return;
    }

    livePlaneMarkers.set(plane.hex, new Plane(plane, addMarker(plane, map)));
}

function updateMarker(plane) {
    const marker = plane.marker;
    marker.setIcon(getIcon(plane.altitude, plane.track, true));
    marker.setLatLng([plane.lat, plane.lon]);
    marker.setZIndexOffset(20000);
    marker.setPopupContent(getPopupText(plane));
}

import { addMarker, getIcon, getPopupText } from './leaflet.js';

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
            livePlaneMarkers.get(hex).remove();
            livePlaneMarkers.delete(hex);
        }
    });
}

const timestamp = (epoch) => new Date(epoch).toISOString();

function plotPlanes(plane, map) {
    plane.distance = ''; // will be undefined otherwise
    plane.time = new Date().toISOString();

    if (!livePlaneMarkers.has(plane.hex)) {
        livePlaneMarkers.set(plane.hex, addMarker(plane, map));
    }

    const marker = livePlaneMarkers.get(plane.hex);
    marker.setIcon(getIcon(plane.altitude, plane.track, true));
    marker.setLatLng([plane.lat, plane.lon]);
    marker.setZIndexOffset(20000);
    marker.setPopupContent(getPopupText(plane));
}

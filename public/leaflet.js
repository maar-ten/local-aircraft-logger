export class LeafletMap {
    constructor(mapId, lat, lon) {
        this.map = L.map(mapId).setView([lat, lon], 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    }
}

export function addMarker(plane, map) {
    const marker = L.marker([plane.lat, plane.lon], { icon: getIcon(plane.altitude, plane.track) }).addTo(map);
    marker.on('mouseover', () => marker.setZIndexOffset(10000));
    marker.on('mouseout', () => marker.setZIndexOffset(0));
    marker.bindPopup(getPopupText(plane));
    marker.setOpacity(plane.opacity);
    return marker;
}

export function addPath(plane, map) {
    return L.polyline([[plane.lat, plane.lon]]).addTo(map);
}

export function updateMarker(marker, plane) {
    marker.setIcon(getIcon(plane.altitude, plane.track, true));
    marker.setLatLng([plane.lat, plane.lon]);
    marker.setZIndexOffset(20000);
    marker.setPopupContent(getPopupText(plane));
}

export function updatePath(path, plane) {
    const coords = path.getLatLngs();
    const newCoords = [plane.lat, plane.lon];

    if (coords[coords.length - 1] !== newCoords) {
      path.addLatLng([plane.lat, plane.lon]);
    }
}

function getIcon(altitude, track, live = false) {
    const rotation = -45 + Number(track); // -45 to correct the plane emoji's default rotation on most systems
    const iconClass = live ? 'plane-icon-live' : 'plane-icon';
    const html = `<div class="${iconClass}" style="transform: rotate(${rotation}deg); background-color: ${getAltitudeColor(altitude)};">✈️</div>`;
    return L.divIcon({ html, className: '', iconSize: [30, 30] });
}

function getPopupText(plane) {
    return `hex: ${plane.hex}<br>flight: ${plane.flight}<br>time: ${plane.time}<br>distance: ${plane.distance} km<br>altitude: ${plane.altitude} ft<br>track: ${plane.track}<br>seen #: ${plane.measurements}`;
}

function getAltitudeColor(altitude) {
    const maximumAltitude = 40000;
    const relativeAltitude = Math.min(Number(altitude) / maximumAltitude, 1);

    const hue = 50 + Math.floor(310 * relativeAltitude); // between yellow (50) and red (360)
    return `hsl(${hue}, 100%, 50%)`;
}

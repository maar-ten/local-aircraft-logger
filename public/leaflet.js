export class LeafletMap {
    constructor(mapId, lat, lon) {
        this.map = L.map(mapId).setView([lat, lon], 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    }
}

export function addMarker(aircraft, map) {
    const marker = L.marker([aircraft.lat, aircraft.lon], { icon: getIcon(aircraft.altitude, aircraft.track) }).addTo(map);
    marker.on('mouseover', () => marker.setZIndexOffset(10000));
    marker.on('mouseout', () => marker.setZIndexOffset(0));
    marker.bindPopup(getPopupText(aircraft));
    marker.setOpacity(aircraft.opacity ?? 1);
    return marker;
}

export function addPath(aircraft, map) {
    return L.polyline([[aircraft.lat, aircraft.lon]]).addTo(map);
}

export function addPathPoints(points, map) {
    return L.polyline(points).addTo(map);
}

export function updateMarker(marker, aircraft) {
    marker.setIcon(getIcon(aircraft.altitude, aircraft.track, true));
    marker.setLatLng([aircraft.lat, aircraft.lon]);
    marker.setZIndexOffset(20000);
    marker.setPopupContent(getPopupText(aircraft));
}

export function updatePath(path, aircraft) {
    const coords = path.getLatLngs();
    const newCoords = [aircraft.lat, aircraft.lon];

    if (coords[coords.length - 1] !== newCoords) {
      path.addLatLng([aircraft.lat, aircraft.lon]);
    }
}

function getIcon(altitude, track, live = false) {
    const rotation = -45 + Number(track); // -45 to correct the aircraft emoji's default rotation on most systems
    const iconClass = live ? 'aircraft-icon-live' : 'aircraft-icon';
    const html = `<div class="${iconClass}" style="transform: rotate(${rotation}deg); background-color: ${getAltitudeColor(altitude)};">✈️</div>`;
    return L.divIcon({ html, className: '', iconSize: [30, 30] });
}

function getPopupText(aircraft) {
    return ''.concat(
        `hex: <a href="https://map.opensky-network.org/?icao=${aircraft.hex}">${aircraft.hex}</a>`,
        `<br>flight: ${aircraft.flight}`,
        `<br>time: ${aircraft.time}`,
        `<br>distance: ${aircraft.distance} km`,
        `<br>altitude: ${aircraft.altitude} ft`,
        `<br>speed: ${aircraft.speed}`,
        `<br>track: ${aircraft.track}`,
        `<br>seen #: ${aircraft.measurements}`
    );
}

function getAltitudeColor(altitude) {
    const maximumAltitude = 40000;
    const relativeAltitude = Math.min(Number(altitude) / maximumAltitude, 1);

    const hue = 50 + Math.floor(310 * relativeAltitude); // between yellow (50) and red (360)
    return `hsl(${hue}, 100%, 50%)`;
}

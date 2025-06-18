export const LayerGroups = {
  LIVE_AIRCRAFTS: 'live',
  LOW_FLYING_AIRCRAFTS: 'low',
  OTHER_PAST_AIRCRAFTS: 'others'
}

export class LeafletMap {
    constructor(mapId, lat, lon) {
        this.liveAircrafts = L.layerGroup([]);
        this.lowFlyingAircrafts = L.layerGroup([]);
        this.otherPastAircrafts = L.layerGroup([]);

        const overlays = {
            "Live": this.liveAircrafts,
            "Past low flying aircrafts": this.lowFlyingAircrafts,
            "Past aircrafts": this.otherPastAircrafts,
        }

        this.map = L.map(mapId, {
            center: [lat, lon],
            zoom: 10,
            layers: [createTileLayer(), this.liveAircrafts]
        });

        L.control.layers(null, overlays).addTo(this.map);
    }

    addTo(layer, group) {
        switch(group) {
            case LayerGroups.LIVE_AIRCRAFTS:
                this.liveAircrafts.addLayer(layer);
                return;
            case LayerGroups.LOW_FLYING_AIRCRAFTS:
                this.lowFlyingAircrafts.addLayer(layer);
                return;
            case LayerGroups.OTHER_PAST_AIRCRAFTS:
                this.otherPastAircrafts.addLayer(layer);
                return;
        }
    }

    addMarker(aircraft, group) {
        const marker = createMarker(aircraft);
        this.addTo(marker, group);
        return marker;
    }

    addPath(aircraft, group) {
        const path = createPath(aircraft);
        this.addTo(path, group);
        return path;
    }

    addPathPoints(points, group) {
        const path = createPathPoints(points);
        this.addTo(path, group);
        return path;
    }
}

function createTileLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    );
}

function createMarker(aircraft) {
    const marker = L.marker([aircraft.lat, aircraft.lon])
        .setIcon(getIcon(aircraft.altitude, aircraft.track))
        .bindPopup(getPopupText(aircraft))
        .setOpacity(aircraft.opacity ?? 1);

    marker.on('mouseover', () => marker.setZIndexOffset(10000))
          .on('mouseout', () => marker.setZIndexOffset(0));

    return marker;
}

function createPath(aircraft) {
    return L.polyline([[aircraft.lat, aircraft.lon]]);
}

function createPathPoints(points) {
    return L.polyline(points);
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
        `hex: <a href="https://map.opensky-network.org/?icao=${aircraft.hex}" target="_blank">${aircraft.hex}</a>`,
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

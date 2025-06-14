const http = require('http');

const hostname = '127.0.0.1';
const port = 8080;

let requestsReceived = 0;
let previousPlane = {};

const response = [{"hex":"4d22d6","flight":"VJT527  ","lat":52.054459,"lon":5.003586,"altitude":12100,"track":160,"speed":276,"closestDistance":8.721308856748651,"closestDistanceTime":1749908352217,"closestDistanceLat":52.054459,"closestDistanceLon":5.003586,"closestDistanceAltitude":12100,"closestDistanceTrack":160,"measurements":37,"lastSeen":1749908507273},{"hex":"486804","flight":"KLM77H  ","lat":52.104663,"lon":5.090829,"altitude":17250,"track":116,"speed":320,"closestDistance":2.9935046844622155,"closestDistanceTime":1749908532242,"closestDistanceLat":52.104663,"closestDistanceLon":5.090829,"closestDistanceAltitude":17250,"closestDistanceTrack":116,"measurements":23,"lastSeen":1749908532242},{"hex":"484164","flight":"","lat":52.152844,"lon":5.016044,"altitude":11575,"track":125,"speed":286,"closestDistance":10.393698269468107,"closestDistanceTime":1749908532242,"closestDistanceLat":52.152844,"closestDistanceLon":5.016044,"closestDistanceAltitude":11575,"closestDistanceTrack":125,"measurements":1,"lastSeen":1749908532242}];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(response));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function generatePlane(responseType) {
    if (responseType === 1) {
        const hex = Date.now().toString();
        const plane = {
            hex,
            flight:'TYW758  ',
            lat: 52.264942, 
            lon: 4.932783,
            altitude: 40000,
            track: 0,
            speed: 0
        };
        previousPlane = plane;
        return [plane];
    } else {
        return [{
            ...previousPlane,
            lat: previousPlane.lat + 1,
            lon: previousPlane.lon - 1,
        }];
    }
}
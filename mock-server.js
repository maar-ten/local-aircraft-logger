const http = require('http');

const hostname = '127.0.0.1';
const port = 8080;

let requestsReceived = 0;
let previousPlane = {};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(JSON.stringify(generatePlane(++requestsReceived % 2)));
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
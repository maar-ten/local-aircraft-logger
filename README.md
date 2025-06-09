Build the container
`sudo docker build -t adsb-client --no-cache .`

Run the script from the local directory using a nodejs image
`docker run --rm -v "$PWD:/app" -w /app node:22-alpine node index.js`
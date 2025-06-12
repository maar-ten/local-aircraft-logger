Run the data collection with a docker nodejs image
`docker run --env-file=.env --rm -v "$PWD:/app" -w /app node:22-alpine node index.js`

Run the data reporting with a docker nodejs image
`docker run --rm -v "$PWD:/app" -w /app node:22-alpine npx http-server -p 3000`

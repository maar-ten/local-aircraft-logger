Run the data collection with a docker nodejs image
`docker run --name data --env-file=.env --rm -v "$PWD:/app" -w /app node:22-alpine node index.js`

Run the data reporting with a docker nodejs image
`docker run --name web -p 3000:3000 --rm -v "$PWD:/app" -w /app node:22-alpine npx http-server -d false -p 3000`

Run the script with a docker nodejs image
`docker run --env-file=.env --rm -v "$PWD:/app" -w /app node:22-alpine node index.js`
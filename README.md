Run the script with a docker nodejs image
`docker run --rm -v "$PWD:/app" -w /app node:22-alpine node index.js --env-file=.env`
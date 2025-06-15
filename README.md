Install docker

`curl -sSL https://get.docker.com | sh`

Run the data collection with a docker nodejs image

`docker run -d --name data -p 8090:8090 --env-file=.env --rm -v "$PWD:/app" -w /app node:22-alpine node index.js`

Run the data reporting with a docker nodejs image

`docker run -d --name web -p 3000:3000 --rm -v "$PWD:/app" -w /app node:22-alpine npx http-server -d false -p 3000`

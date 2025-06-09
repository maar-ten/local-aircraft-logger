FROM node:22-alpine AS build-env
COPY . /app
WORKDIR /app

# RUN apk add --no-cache tzdata &&\
#     npm ci --omit=dev

CMD ["node", "index.js"]
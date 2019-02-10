FROM node:alpine
COPY . /tmp/src
WORKDIR /tmp/src
RUN apk add --no-cache -t build-deps make gcc g++ python ca-certificates libc-dev wget git \
    && npm install \
    && npm run build \
    && mv lib/ /matrix-haiku-bot/ \
    && mv node_modules / \
    && cd / \
    && rm -rf /tmp/* \
    && apk del build-deps

WORKDIR /

ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/data/config

VOLUME ["/data"]
CMD node /matrix-haiku-bot/index.js
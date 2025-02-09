FROM node:22.12-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

RUN npm ci --ignore-scripts --omit-dev

# Make stdin and stdout available
ENV STDIN_PIPE=/pipe/stdin
ENV STDOUT_PIPE=/pipe/stdout

RUN mkdir -p /pipe && \
    mkfifo /pipe/stdin && \
    mkfifo /pipe/stdout

ENTRYPOINT ["node", "build/index.js"]
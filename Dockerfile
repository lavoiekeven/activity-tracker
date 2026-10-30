FROM node:22-alpine AS client-build

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM node:22-alpine AS server-build

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001 \
    DATA_DIR=/data \
    CLIENT_DIST_DIR=/app/client-dist

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev \
    && mkdir -p /data \
    && chown node:node /data
COPY --from=server-build --chown=node:node /app/server/dist ./dist
COPY --from=client-build --chown=node:node /app/client/dist /app/client-dist

USER node
EXPOSE 3001
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]

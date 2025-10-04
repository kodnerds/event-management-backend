# ---- Base stage ----
FROM node:22-alpine as base

WORKDIR '/app'

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base as production

ENV NODE_PATH=./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["npm", "start"]

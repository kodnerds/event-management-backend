# ---- Base stage ----
FROM node:22.13.1 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- Development stage ----
FROM base AS development
RUN npm install --save-dev nodemon ts-node typescript
COPY . .
EXPOSE 9000
CMD ["npm", "run", "dev"]

# ---- Production stage ----
FROM base AS production
COPY . .
RUN npm run build
EXPOSE 8001
CMD ["npm", "run", "start"]

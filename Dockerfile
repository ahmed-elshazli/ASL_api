# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- DEVELOPMENT ----------
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

CMD ["npm", "run", "start:dev"]

# ---------- PRODUCTION ----------
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
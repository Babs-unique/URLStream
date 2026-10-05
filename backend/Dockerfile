# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0

# =========================
# Build stage
# =========================
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# =========================
# Production stage
# =========================
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3030

USER node

CMD ["npm", "run", "start:prod"]
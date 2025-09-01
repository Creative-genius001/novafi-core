# ------------------------------------------------------------
# Stage 1: base deps (cached)
# -----------------------------------------------------------
FROM node:22.18.0-alpine AS deps
WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm ci

# ------------------------------------------------------------
# Stage 2: build (uses dev deps)
# ------------------------------------------------------------
FROM node:22.18.0-alpine AS builder
WORKDIR /app


COPY --from=deps /app/node_modules ./node_modules


COPY tsconfig*.json nest-cli.json* ./
COPY src ./src
COPY package*.json ./


RUN npm run build

# ------------------------------------------------------------
# Stage 3: production runner
# ------------------------------------------------------------
FROM node:22.18.0-alpine AS runner
WORKDIR /app



COPY package.json package-lock.json* ./

ENV NODE_ENV=production
RUN npm ci --omit=dev


COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]

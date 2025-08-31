FROM node:22.18.0-alpine AS deps
WORKDIR /app


ENV NODE_ENV=development
RUN npm set fund false && npm set audit false


COPY package.json package-lock.json* ./
RUN npm ci


FROM node:22.18.0-alpine AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY tsconfig*.json nest-cli.json* ./
COPY src ./src

# Build TS -> JS
RUN npm run build

# ------------------------------------------------------------
# Stage 3: production runner
# ------------------------------------------------------------
FROM node:22.18.0-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -s /bin/sh -D node

# Copy only necessary runtime files
COPY package.json package-lock.json* ./

# Install only production dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Copy compiled app
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

# Healthcheck (adjust path if you have a health route)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT}/ping || exit 1

USER node

# Start app
CMD ["node", "dist/main.js"]

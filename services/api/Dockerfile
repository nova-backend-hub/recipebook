# ==========================================
# MULTI-STAGE DOCKERFILE: RECIPEBOOK API
# ==========================================

# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy root configurations
COPY package.json ./
COPY services/api/package.json services/api/
COPY packages/shared packages/shared/

# Install dependencies
RUN npm install

# Copy source codes
COPY services/api services/api/
COPY packages/shared packages/shared/

# Compile TypeScript
WORKDIR /usr/src/app/services/api
RUN npx prisma generate
RUN npm run build

# 2. Production Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/shared ./packages/shared
COPY --from=builder /usr/src/app/services/api/package.json services/api/
COPY --from=builder /usr/src/app/services/api/src services/api/src
COPY --from=builder /usr/src/app/services/api/prisma services/api/prisma

EXPOSE 5000
WORKDIR /usr/src/app/services/api

# Launch API core service listener
CMD ["npx", "tsx", "src/index.ts"]

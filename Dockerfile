# ==========================================
# ROOT DOCKERFILE: RECIPEBOOK API PIPELINE
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

# Compile TypeScript and generate Prisma Client
WORKDIR /usr/src/app/services/api
RUN npx prisma generate
RUN npm run build

# 2. Production Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/services/api/dist services/api/dist
COPY --from=builder /usr/src/app/services/api/prisma services/api/prisma

EXPOSE 5000
WORKDIR /usr/src/app/services/api

# Launch API core service listener
CMD ["node", "dist/index.js"]

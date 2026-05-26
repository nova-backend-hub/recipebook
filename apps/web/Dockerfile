# ==========================================
# DOCKERFILE: RECIPEBOOK WEB (NEXT.JS APP)
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared packages/shared/
COPY packages/ui packages/ui/

RUN npm install

COPY apps/web apps/web/
COPY packages/shared packages/shared/
COPY packages/ui packages/ui/

WORKDIR /usr/src/app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/web/package.json apps/web/
COPY --from=builder /usr/src/app/apps/web/.next apps/web/.next
COPY --from=builder /usr/src/app/apps/web/public apps/web/public

EXPOSE 3000
WORKDIR /usr/src/app/apps/web

CMD ["npm", "run", "start"]

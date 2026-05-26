# ==========================================
# DOCKERFILE: RECIPEBOOK ADMIN PANEL
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package.json ./
COPY apps/admin/package.json apps/admin/
COPY packages/shared packages/shared/
COPY packages/ui packages/ui/

RUN npm install

COPY apps/admin apps/admin/
COPY packages/shared packages/shared/
COPY packages/ui packages/ui/

WORKDIR /usr/src/app/apps/admin
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/admin/package.json apps/admin/
COPY --from=builder /usr/src/app/apps/admin/.next apps/admin/.next
COPY --from=builder /usr/src/app/apps/admin/public apps/admin/public

EXPOSE 3001
WORKDIR /usr/src/app/apps/admin

CMD ["npm", "run", "start"]

# ─────────────────────────────────────────────────────────────────────────────
#  Image produksi SIGAP-Bansos UI (Next.js 16, App Router, output: standalone).
#  Dibangun oleh stage "Docker image" di Jenkinsfile.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ── Dependencies ─────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ── Build ────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# PENTING: variabel NEXT_PUBLIC_* di-INLINE ke bundle saat `next build`, bukan
# dibaca saat container start. Jadi nilainya harus masuk DI SINI — Jenkins
# mengisinya lewat `--build-arg`. Kalau URL API berubah, image ini wajib rebuild.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/v1
ARG NEXT_PUBLIC_EXPLORER_BASE=https://amoy.polygonscan.com
ARG NEXT_PUBLIC_CHAIN_NAME="Polygon Amoy"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_EXPLORER_BASE=$NEXT_PUBLIC_EXPLORER_BASE \
    NEXT_PUBLIC_CHAIN_NAME=$NEXT_PUBLIC_CHAIN_NAME \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runner ───────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `output: "standalone"` -> server minimal di root + aset statis terpisah.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Project ini belum punya folder `public/`. Kalau nanti ditambah, aktifkan baris:
# COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

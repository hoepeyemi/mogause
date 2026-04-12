# mogause frontend — Next.js standalone
# Build (from repo root, recommended for correct standalone paths):
#   docker build -f frontend/Dockerfile -t mogause-frontend \
#     --build-arg NEXT_PUBLIC_API_URL=http://localhost:4002 .
#
# Build (frontend only as context — same Dockerfile adapts layout):
#   docker build -t mogause-frontend .

FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:4002
ARG NEXT_PUBLIC_SERVER_ADDRESS=
ARG NEXT_PUBLIC_AGENT_PRIVATE_KEY=
ARG NEXT_PUBLIC_STELLAR_NETWORK=stellar:testnet

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SERVER_ADDRESS=$NEXT_PUBLIC_SERVER_ADDRESS
ENV NEXT_PUBLIC_AGENT_PRIVATE_KEY=$NEXT_PUBLIC_AGENT_PRIVATE_KEY
ENV NEXT_PUBLIC_STELLAR_NETWORK=$NEXT_PUBLIC_STELLAR_NETWORK

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Monorepo builds may emit `.next/standalone/frontend/`; single-package emits `.next/standalone/`.
RUN mkdir -p /opt/run && \
    if [ -f /app/.next/standalone/server.js ]; then \
      cp -a /app/.next/standalone/. /opt/run/; \
    elif [ -f /app/.next/standalone/frontend/server.js ]; then \
      cp -a /app/.next/standalone/frontend/. /opt/run/; \
    else \
      echo "standalone server.js not found" && ls -la /app/.next/standalone && exit 1; \
    fi

FROM base AS runner
WORKDIR /opt/run
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /opt/run/ ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Writable cache dir (Compose may mount tmpfs here). Image runs as root for simple tmpfs writes.
RUN mkdir -p .next/cache

EXPOSE 3000
CMD ["node", "server.js"]

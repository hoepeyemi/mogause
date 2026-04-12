# mogause backend — Express + x402 (Stellar / XLM)
# Build: docker build -t mogause-backend .
# Run:   docker run --env-file .env -p 4002:4002 mogause-backend

FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Defaults (override at runtime)
ENV PORT=4002
ENV HOST=0.0.0.0

# Server
# PORT, HOST, CORS_ORIGIN
# Stellar
# STELLAR_NETWORK, HORIZON_URL, SKIP_HORIZON_TX_VERIFY, EXPLORER_BASE
# SERVER_ADDRESS, AGENT_PRIVATE_KEY, MPP_SECRET_KEY, STELLAR_RECIPIENT
# AI
# GROQ_API_KEY, GEMINI_API_KEY
# Sponsor / onboarding (optional)
# SPONSOR_SECRET_KEY, CHANNEL_SECRET_KEYS, USDC_ISSUER, MAX_TX_FEE, MAX_STARTING_BALANCE, CHANNEL_RESERVATION_TTL_MS
# Ops
# SIMULATION_MODE, RATE_LIMIT_PER_IP_WINDOW_MS, RATE_LIMIT_PER_IP_MAX, CONTRACT_ADDRESS

EXPOSE 4002
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4002)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]

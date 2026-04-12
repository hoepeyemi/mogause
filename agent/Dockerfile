# mogause CLI agent — connects to backend over HTTP + x402 (Stellar / XLM)
# Build: docker build -t mogause-agent .
# Run (interactive): docker run -it --env-file .env mogause-agent
# One-shot:          docker run --rm --env-file .env mogause-agent node dist/agent.js <<< "your query"

FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

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

# Required / common (set via --env-file or -e)
# AGENT_PRIVATE_KEY   Stellar secret (S...)
# AGENT_SERVER_URL    Backend base URL (e.g. http://backend:4002)
# NETWORK             testnet | mainnet
# GROQ_API_KEY        Groq API key
# GEMINI_API_KEY      Google Gemini (optional fallback)

ENV AGENT_SERVER_URL=http://localhost:4002
ENV NETWORK=testnet

# Interactive REPL by default; override CMD for automation.
CMD ["node", "dist/agent.js"]

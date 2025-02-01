# Build stage
FROM node:20-slim AS builder

# Set working directory for build
WORKDIR /build

# Copy package files and typescript config
COPY package*.json tsconfig.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit

# Copy TypeScript source files
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-slim AS release

# Create app directory
WORKDIR /app

# Copy built files and package files from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package*.json ./

# Set production environment
ENV NODE_ENV=production

# Declare that we expect an API key
ENV ANTHROPIC_API_KEY=""

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit

# Run as non-root user for security
USER node

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]
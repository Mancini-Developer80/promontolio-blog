# Stage 1: Build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on package manifests
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate the client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Remove development dependencies to keep the image lightweight
RUN npm prune --omit=dev

# Stage 2: Runtime environment
FROM node:20-alpine

WORKDIR /app

# Copy production artifacts from builder stage
COPY --from=builder /app /app

# Expose the application port required by Cloud Run
EXPOSE 8080

# Start the Node.js application server
CMD ["node", "server.js"]
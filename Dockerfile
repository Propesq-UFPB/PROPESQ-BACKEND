FROM oven/bun:1-alpine AS base

WORKDIR /usr/src/app

COPY bun.lock package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

RUN bun --bun run build

# For production
CMD ["bun", "--bun", "run", "start:server"]

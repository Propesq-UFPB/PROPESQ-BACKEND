# syntax=docker/dockerfile:1

########################################
# DEV
########################################
FROM node:24-alpine AS dev

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:migrate:dev"]


########################################
# PROD BUILD
########################################
FROM oven/bun:1-alpine AS prod-build

WORKDIR /usr/src/app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

COPY . .

RUN bun --bun run build


########################################
# PROD RUNTIME
########################################
FROM oven/bun:1-alpine AS prod

WORKDIR /usr/src/app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile --production

COPY prisma ./prisma
RUN bunx prisma generate

COPY --from=prod-build /usr/src/app/dist ./dist
COPY --from=prod-build /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "--bun", "run", "start:server"]

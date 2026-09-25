# Base node image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage - builds all workspaces via turbo
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# Generate Prisma client and build all apps
WORKDIR /app/apps/api
RUN pnpm run db:generate

WORKDIR /app
RUN pnpm run build

# Web Production Image
FROM base AS web
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/web ./apps/web
WORKDIR /app/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]

# API Production Image
FROM base AS api
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
# Run migrations (push) then start API
CMD ["sh", "-c", "pnpm run db:migrate:deploy && pnpm start"]
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN npm install -g pnpm@9.15.9
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

# Dependency metadata is copied before source code so ordinary TS/TSX/CSS edits
# do not invalidate the expensive dependency-install layer.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/extension/package.json apps/extension/package.json
COPY apps/e2e/package.json apps/e2e/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

FROM deps AS source
COPY . .

FROM source AS api-builder
ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/usability_db?schema=public
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm --filter @usability-testing/api db:generate
RUN pnpm --filter @usability-testing/shared build
RUN pnpm --filter @usability-testing/api build

FROM source AS web-builder
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_EXTENSION_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_EXTENSION_ID=$NEXT_PUBLIC_EXTENSION_ID
RUN pnpm --filter @usability-testing/shared build
RUN --mount=type=cache,id=next-cache,target=/app/apps/web/.next/cache \
    pnpm --filter web build

# Next standalone keeps the production web image small and avoids copying
# the monorepo's complete node_modules tree into the runtime image.
FROM base AS web
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=web-builder /app/apps/web/.next/standalone ./
COPY --from=web-builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# API still uses the pnpm workspace runtime layout. Its build is now isolated
# from web/extension builds, while the dependency layer remains reusable.
FROM base AS api
ENV NODE_ENV=production
COPY --from=api-builder /app/package.json ./
COPY --from=api-builder /app/pnpm-workspace.yaml ./
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/packages/shared ./packages/shared
COPY --from=api-builder /app/apps/api ./apps/api
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["sh", "-c", "pnpm run db:migrate:deploy && pnpm start"]

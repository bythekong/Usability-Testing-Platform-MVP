FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN npm install -g pnpm@9.15.9

FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_EXTENSION_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_EXTENSION_ID=$NEXT_PUBLIC_EXTENSION_ID
COPY . .
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://postgres:password@localhost:5432/usability_db?schema=public" pnpm run db:generate

WORKDIR /app
RUN pnpm run build

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
CMD ["sh", "-c", "pnpm run db:migrate:deploy && pnpm start"]

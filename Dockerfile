# Build stage
FROM node:20-alpine AS builder

# 作業ディレクトリの設定
WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma
# After installing dependencies
RUN pnpm install
RUN pnpm exec prisma generate

# ソースコードのコピー
COPY . .

# TypeScriptのビルド
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# Copy package.json and lock file
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# 🔥 Install only production dependencies
RUN pnpm install --prod

# Copy the built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# Security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/index.js"]


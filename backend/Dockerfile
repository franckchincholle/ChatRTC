# ============================================
# Stage 1: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Copier le code source
COPY src ./src

# Build TypeScript
RUN npm run build

# Générer le client Prisma
RUN npx prisma generate

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer UNIQUEMENT les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier les fichiers Prisma pour les migrations
COPY prisma ./prisma/

# Copier le build depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Exposer le port
EXPOSE 3001

# Script de démarrage avec migrations Prisma
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
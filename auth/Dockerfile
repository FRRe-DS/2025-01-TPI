# Multi-stage build para optimizar el tamaño
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Build de producción
RUN npm run build

# Stage de producción
FROM node:22-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos buildados desde el stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Cambiar ownership al usuario nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto 3001
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/src/health-check.js || exit 1

# Comando por defecto
CMD ["node", "dist/src/main.js"]

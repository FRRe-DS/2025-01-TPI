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

# Variables de entorno como build args (Vite necesita estas en tiempo de build)
ARG VITE_KEYCLOAK_ISSUER
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_API_GATEWAY_URL
ARG VITE_API_BASE
ARG VITE_APP_ORIGIN

# Establecer las variables de entorno para el build
ENV VITE_KEYCLOAK_ISSUER=$VITE_KEYCLOAK_ISSUER
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_APP_ORIGIN=$VITE_APP_ORIGIN

# Build de producción
RUN npm run build

# Stage de producción con nginx
FROM nginx:alpine

# Copiar archivos buildados (React Router v7 genera en build/client)
COPY --from=builder /app/build/client /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]

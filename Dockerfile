# =============================================================================
# Vitrina Frontend - Multi-stage Dockerfile
# =============================================================================
# Stage 1 (builder): instala deps, compila Vite (genera dist/)
# Stage 2 (runtime): nginx:alpine sirviendo los archivos estáticos
# =============================================================================

FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Las variables VITE_* se inyectan en build time via ARG.
# En producción, docker-compose.prod.yml las pasa como build args.
ARG VITE_API_URL
ARG VITE_AUTH_SERVICE_URL
ARG VITE_CLOUD_MODULE_URL
ARG VITE_HOST_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

RUN npm run build

# -----------------------------------------------------------------------------
# Runtime: nginx:alpine sirve los archivos estáticos.
# Vite ya genera los paths con el base '/vitrina/' configurado en vite.config.js.

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Files go under /vitrina/ to match Vite base path.
# Request for /vitrina/assets/foo.js → /usr/share/nginx/html/vitrina/assets/foo.js
COPY --from=builder /usr/src/app/dist ./vitrina

RUN printf 'server {\n\
    listen 3007;\n\
    root /usr/share/nginx/html;\n\
    location /vitrina/ {\n\
        try_files $uri $uri/ /vitrina/index.html;\n\
        add_header Cache-Control "no-cache";\n\
    }\n\
    location /vitrina/assets/ {\n\
        add_header Cache-Control "public, max-age=31536000, immutable";\n\
    }\n\
    location / {\n\
        return 302 /vitrina/;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3007

CMD ["nginx", "-g", "daemon off;"]

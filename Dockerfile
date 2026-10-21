# Image Cloud Run : build Vite puis serveur Express (server.ts) en mode production
FROM node:22-slim

WORKDIR /app

# Dépendances (le conflit esbuild/vite existant impose --legacy-peer-deps)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx vite build

ENV NODE_ENV=production
# Cloud Run fournit PORT (8080 par défaut), lu par server.ts
ENV PORT=8080
EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]

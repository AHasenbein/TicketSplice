FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/

RUN npm ci

COPY . .

RUN npm run -w @ticket-splice/api build && npm prune --omit=dev

ENV NODE_ENV=production
ENV API_PORT=4000

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]

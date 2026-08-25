FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
CMD ["node", "src/index.js"]

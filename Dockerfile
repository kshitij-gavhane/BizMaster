FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

# Start server (serves API and static client)
CMD ["node", "dist/index.js"]



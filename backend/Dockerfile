FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Run server
CMD ["node", "server.js"]

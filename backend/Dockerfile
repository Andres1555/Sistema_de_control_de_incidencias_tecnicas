FROM node:18-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy app source
COPY backend/ ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]

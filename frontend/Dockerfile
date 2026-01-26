FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# --- ESTO ES LO QUE ESTÁ FALTANDO ---
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
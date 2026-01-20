FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
# Ahora npm install funcionará porque esta imagen tiene Python para sqlite3
RUN npm install

COPY . .

# Permisos para la base de datos SQLite
RUN chmod -R 777 .

EXPOSE 8080

CMD ["node", "server.js"]
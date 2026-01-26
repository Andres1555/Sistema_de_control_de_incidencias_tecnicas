FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# Permisos para que Sequelize cree/escriba el .sqlite en la raíz
RUN chmod -R 777 /usr/src/app
# Exponemos el 8080 que es donde escuchará el proceso de Node
EXPOSE 8080
CMD ["node", "server.js"]
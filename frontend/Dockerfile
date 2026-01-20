FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Construimos la app para producción
RUN npm run build

EXPOSE 5173

# Vite Preview expone la app compilada en el puerto 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
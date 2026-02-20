# 1. Usamos una versión oficial y ligera de Node.js
FROM node:20-slim

# 2. Instalamos ffmpeg, python3 y el alias oficial de Ubuntu
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# 3. Creamos la carpeta donde vivirá tu app
WORKDIR /app

# 4. Copiamos tus archivos de dependencias
COPY package*.json ./

# 5. Instalamos los paquetes de Node (ahora sí encontrará Python)
RUN npm ci

# 6. Copiamos el resto de tu código
COPY . .

# 7. Exponemos el puerto de Express
EXPOSE 3000

# 8. Comando para iniciar tu servidor
CMD ["npm", "start"]
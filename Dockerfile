FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia lo schema Prisma e genera il client per Linux
COPY prisma ./prisma/
RUN npx prisma generate

# Copia il resto dell'applicazione
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
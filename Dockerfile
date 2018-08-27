FROM node:8.11.4-alpine

WORKDIR /root

COPY package.json package-lock.json ./
RUN npm install

COPY src .

CMD node app.js

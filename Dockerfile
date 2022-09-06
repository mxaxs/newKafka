#!/bin/bash
FROM node:current-alpine3.16

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]

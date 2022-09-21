#!/bin/bash
FROM node:current-alpine3.16

ENV NODE_ENV=production

RUN mkdir -p /usr/share/exams

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 4000

CMD ["npm", "start"]

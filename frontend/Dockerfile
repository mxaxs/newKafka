FROM nginx:1.17.1-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./dist/spa /usr/share/nginx/html

EXPOSE 80

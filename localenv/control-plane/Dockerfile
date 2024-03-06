FROM nginx:1.25.3-alpine

RUN  rm -f /etc/nginx/conf.d/*
COPY ./nginx.conf /etc/nginx/conf.d/

COPY ./assets/index.html /usr/share/nginx/html/index.html



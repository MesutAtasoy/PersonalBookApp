# FROM nginx:1.17.1-alpine
# COPY /dist/fuse /usr/share/nginx/html

FROM nginx:1.17.1-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY /dist/fuse /usr/share/nginx/html
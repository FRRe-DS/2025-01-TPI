FROM openresty/openresty:alpine

COPY ./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

EXPOSE 80
EXPOSE 443
CMD ["openresty", "-g", "daemon off;"]
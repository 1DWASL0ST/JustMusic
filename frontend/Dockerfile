FROM node:18-alpine AS build
WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

EXPOSE 3000

RUN npm ci --only=production

COPY src /app/src
COPY public /app/public

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
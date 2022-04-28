FROM node:latest

LABEL traefik.enable true
LABEL traefik.port 8080
#LABEL traefik.http.routers.banana.middlewares auth
LABEL traefik.http.routers.bananaback.middlewares auth_then_strip
LABEL traefik.http.routers.bananaback.rule Host(`localhost`) && (Path(`/send`) && Method(`POST`))

WORKDIR /app

COPY . .

RUN yarn

CMD ["yarn", "start"]
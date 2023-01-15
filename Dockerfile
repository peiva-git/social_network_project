FROM node:latest
RUN mkdir -p "/usr/src/app"
WORKDIR /usr/src/app
COPY . .
WORKDIR client
RUN npm install
RUN npm run build
RUN mkdir "../server/public"
RUN cp -r -t ../server/public dist/*
WORKDIR ../server
RUN npm install
EXPOSE 8080

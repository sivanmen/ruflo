FROM node:20-alpine

RUN apk add --no-cache git python3 make g++ bash curl

RUN npm install -g claude-flow@latest supergateway@latest

WORKDIR /data
VOLUME ["/data"]

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=3000
EXPOSE 3000

CMD ["/entrypoint.sh"]

FROM node:20-alpine

RUN apk add --no-cache git python3 make g++ bash curl

WORKDIR /app

RUN npm install -g claude-flow@latest supergateway@latest

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=3000
EXPOSE 3000

CMD ["/entrypoint.sh"]

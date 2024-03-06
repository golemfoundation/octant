FROM alpine:latest

WORKDIR /app

RUN apk add curl jq

COPY --chmod=744 ./entrypoint.sh ./entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

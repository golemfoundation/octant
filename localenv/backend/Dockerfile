FROM octant/backend-base:latest

WORKDIR /app

RUN apt update && apt install -y curl

COPY --chmod=744 ./entrypoint.sh ./localenv-entrypoint.sh

ENTRYPOINT ["/app/localenv-entrypoint.sh"]

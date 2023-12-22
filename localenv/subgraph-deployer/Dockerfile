FROM octant/subgraph:latest

WORKDIR /app

RUN apk add curl

COPY --chmod=744 ./entrypoint.sh ./deployer-entrypoint.sh

ENTRYPOINT ["/app/deployer-entrypoint.sh"]

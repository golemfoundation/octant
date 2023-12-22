FROM octant/contracts:latest as contracts

WORKDIR /app

COPY --chmod=744 ./entrypoint.sh ./deployer-entrypoint.sh

ENTRYPOINT ["/app/deployer-entrypoint.sh"]

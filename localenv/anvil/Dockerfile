FROM europe-docker.pkg.dev/wildland-dev/internal/octant/anvil:latest

RUN apk update && apk add curl

WORKDIR /home/foundry

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8545

ENV MNEMONIC="test test test test test test test test test test test junk"
ENV CHAIN_ID="1337"
ENV GAS_LIMIT="50000000"

ENTRYPOINT ["/home/foundry/entrypoint.sh"]

HEALTHCHECK --start-period=3s CMD curl -H 'Content-Type: application/json' -X POST --fail --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":67}' 'http://localhost:8545/' || exit 1

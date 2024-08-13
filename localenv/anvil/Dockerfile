FROM europe-docker.pkg.dev/wildland-dev/internal/octant/anvil:latest

WORKDIR /home/foundry

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8545

ENV MNEMONIC="test test test test test test test test test test test junk"
ENV CHAIN_ID="1337"
ENV GAS_LIMIT="50000000"

ENTRYPOINT ["/home/foundry/entrypoint.sh"]

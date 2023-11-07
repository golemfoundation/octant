FROM rust:alpine3.17 as builder

ENV FOUNDRY_TAG=nightly-13af418e724e141ae7dfa7957476d691eee7d0e9

# TODO: compare sha of tar with expected value
# ENV FOUNDRY_SHA=

RUN apk add musl-dev

WORKDIR /foundry 
RUN wget https://github.com/foundry-rs/foundry/archive/refs/tags/${FOUNDRY_TAG}.tar.gz \
    && tar -xzvf ${FOUNDRY_TAG}.tar.gz \
    && mv foundry-${FOUNDRY_TAG} foundry

WORKDIR /foundry/foundry 

RUN CFLAGS=-mno-outline-atomics cargo install --path ./crates/anvil --profile local --force

FROM alpine:3.18.4
WORKDIR /anvil

RUN apk add curl

COPY --from=builder /foundry/foundry/target/local/anvil /usr/local/bin/
COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8545

ENV MNEMONIC="test test test test test test test test test test test junk"
ENV CHAIN_ID="1337"
ENV GAS_LIMIT="50000000"

ENTRYPOINT ["/anvil/entrypoint.sh"]

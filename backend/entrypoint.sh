#!/usr/bin/env bash
# Docker entrypoint for CI
set -ex

timeout --foreground -s TERM 60 bash -c \
    'until [[ "$(dig +search +short -t A ${0})" != "" ]]; do\
    >&2 echo "[-] Waiting for ${0} nslookup" && sleep 3;\
    done' $(sed -E -e 's_.*://([^/@]*@)?([^/:]+).*_\2_' <<< $SUBGRAPH_ENDPOINT)

timeout --foreground -s TERM 60 bash -c \
    'until [[ "$(dig +search +short -t A ${0})" != "" ]]; do\
    >&2 echo "[-] Waiting for ${0} nslookup" && sleep 3;\
    done' $(sed -E -e 's_.*://([^/@]*@)?([^/:]+).*_\2_' <<< $ETH_RPC_PROVIDER_URL)

poetry run flask db upgrade
poetry run python startup.py

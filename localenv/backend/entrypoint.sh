#!/usr/bin/env bash

set -ueo pipefail

wait_for_contracts(){
    curl  --retry-connrefused --retry 10 --retry-delay 5 --max-time 300 \
      -s -X GET "${CONTRACTS_DEPLOYER_URL}"
}

echo Waiting for contracts deployment ...
wait_for_contracts > localhost-contracts
set -a && source localhost-contracts && set +a

./entrypoint.sh

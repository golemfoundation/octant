#!/usr/bin/env sh
# Docker entrypoint
set -ex

NETWORK=${1:-"sepolia"}

cd /app

echo "Network:      $NETWORK"
echo
echo "Deploy"
yarn deploy:$NETWORK

if [[ "$NETWORK" != "localhost" && "$NETWORK" != "local" ]]; then
echo "Verify"
yarn verify:$NETWORK
fi

if [[ $2 ]]; then
	cp deployments/clientEnv $2
fi

if [[ "${FORWARD_FIRST_EPOCH-:}" == "true" ]]; then
	echo "Forwarding first epoch ..." 
  r=$(curl -s -X POST "${LOCAL_RPC_URL}" -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"evm_increaseTime\",\"params\":[${EPOCH_DURATION}],\"id\":1}")
	echo "Forwarded time by ${EPOCH_DURATION}: ${r}"
fi

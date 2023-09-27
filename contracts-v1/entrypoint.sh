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

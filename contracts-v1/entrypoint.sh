#!/usr/bin/env sh
# Docker entrypoint
set -e

NETWORK=${1:-"sepolia"}

echo "Network:      $NETWORK"
echo
echo "Deploy"
yarn deploy:$NETWORK
echo "Verify"
yarn verify:$NETWORK

if [[ $2 ]]; then
	cp deployments/clientEnv $2
fi

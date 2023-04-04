#!/usr/bin/env sh
# Docker entrypoint
set -e

NETWORK=${1:-"goerli"}

echo "Network:      $NETWORK"
echo
echo "Deploy"
yarn deploy:$NETWORK
echo "Verify"
yarn verify:$NETWORK

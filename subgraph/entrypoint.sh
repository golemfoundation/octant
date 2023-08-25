#!/usr/bin/env sh
# Docker entrypoint
set -e

NETWORK=${NETWORK:-"sepolia"}
SUBGRAPH_URL=${SUBGRAPH_URL:-"http://127.0.0.1:8020"}
IPFS_URL=${IPFS_URL:-"http://127.0.0.1:5001"}
LABEL=${VERSION_TAG:-"VM_$HOSTNAME"}
NODE_NAME=${NODE_NAME:-"octant"}
NETWORK_FILE=${NETWORK_FILE:-"./networks.json"}
EPOCHS_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.Epochs.address")

echo "Node name:    $NODE_NAME"
echo "Network:      $NETWORK"
echo "Label:        $LABEL"
echo "Subgraph URL: $SUBGRAPH_URL"
echo "IPFS URL:     $IPFS_URL"
echo "EPOCHS addr:  $EPOCHS_ADDRESS"
echo
# echo "Replace hardcoded contract address"
# sed -i'' -E "s/Address.fromString\(.+\)/Address.fromString\('$EPOCHS_ADDRESS')/g" src/epochs.ts
echo "Code generation"
npx graph codegen
echo "Build graph"
npx graph build --network "$NETWORK" --network-file "$NETWORK_FILE"
echo "Create node"
npx graph create --node "$SUBGRAPH_URL" "$NODE_NAME"
echo "Deploy code to server"
npx graph deploy --node "$SUBGRAPH_URL" --ipfs "$IPFS_URL" --network "$NETWORK" --network-file "$NETWORK_FILE" -l "$LABEL" "$NODE_NAME"

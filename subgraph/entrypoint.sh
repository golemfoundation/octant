#!/usr/bin/env sh
# Docker entrypoint
set -e

NETWORK=${NETWORK:-"goerli"}
SUBGRAPH_URL=${SUBGRAPH_URL:-"http://127.0.0.1:8020"}
IPFS_URL=${IPFS_URL:-"http://127.0.0.1:5001"}
LABEL=${CI_COMMIT_SHORT_SHA:-"VM_$HOSTNAME"}
NODE_NAME=${NODE_NAME:-"octant"}

echo "Node name:    $NODE_NAME"
echo "Network:      $NETWORK"
echo "Label:        $LABEL"
echo "Subgraph URL: $SUBGRAPH_URL"
echo "IPFS URL:     $IPFS_URL"
echo
echo "Code generation"
npx graph codegen
echo "Build graph"
npx graph build --network "$NETWORK"
echo "Create node"
npx graph create --node "$SUBGRAPH_URL" "$NODE_NAME"
echo "Deploy code to server"
npx graph deploy --node "$SUBGRAPH_URL" --ipfs "$IPFS_URL" --network "$NETWORK" -l "$LABEL" "$NODE_NAME"

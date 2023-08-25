#!/usr/bin/env sh
# Docker entrypoint
set -e

NETWORK=${NETWORK:-"sepolia"}
SUBGRAPH_URL=${SUBGRAPH_URL:-"http://127.0.0.1:8020"}
IPFS_URL=${IPFS_URL:-"http://127.0.0.1:5001"}
LABEL=${VERSION_TAG:-"VM_$HOSTNAME"}
NODE_NAME=${NODE_NAME:-"octant"}
NETWORK_FILE=${NETWORK_FILE:-"./networks.json"}
export GNT_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.GNT.address")
export GLM_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.GLM.address")
export EPOCHS_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.Epochs.address")

echo "Node name:    $NODE_NAME"
echo "Network:      $NETWORK"
echo "Label:        $LABEL"
echo "Subgraph URL: $SUBGRAPH_URL"
echo "IPFS URL:     $IPFS_URL"
echo "GNT addr:     $GNT_CONTRACT_ADDRESS"
echo "GLM addr:     $GLM_CONTRACT_ADDRESS"
echo "EPOCHS addr:  $EPOCHS_CONTRACT_ADDRESS"
echo
echo "Replace hardcoded contract addresses"
for i in src/*template*; do
    echo "Replacing in $i"
    F=$(echo $i | sed 's/template\.//')
    envsubst < $i > $F
done
if [ "$1" = "--no-run" ]; then
    echo "Exiting, since --no-run was passed"
    exit 0;
fi

echo "Code generation"
npx graph codegen
echo "Build graph"
npx graph build --network "$NETWORK" --network-file "$NETWORK_FILE"
echo "Create node"
npx graph create --node "$SUBGRAPH_URL" "$NODE_NAME"
echo "Deploy code to server"
npx graph deploy --node "$SUBGRAPH_URL" --ipfs "$IPFS_URL" --network "$NETWORK" --network-file "$NETWORK_FILE" -l "$LABEL" "$NODE_NAME"

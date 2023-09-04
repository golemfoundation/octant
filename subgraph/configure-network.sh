#!/usr/bin/env sh

set -e

NETWORK=${NETWORK:-"localhost"}
NETWORK_FILE=${NETWORK_FILE:-"./networks.json"}
export GNT_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.GNT.address")
export GLM_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.GLM.address")
export EPOCHS_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.Epochs.address")

echo "Network:      $NETWORK"
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

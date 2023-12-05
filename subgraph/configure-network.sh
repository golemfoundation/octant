#!/usr/bin/env sh

set -ue

NETWORK=${NETWORK:-"localhost"}
NETWORK_FILE=${NETWORK_FILE:-"./networks.json"}

ARTIFACTS_DIR="./generated"

export GLM_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.GLM.address")
export EPOCHS_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.Epochs.address")
export PROPOSALS_CONTRACT_ADDRESS=$(cat $NETWORK_FILE | jq -r ".${NETWORK}.Proposals.address")

echo "Network:         $NETWORK"
echo "GLM addr:        $GLM_CONTRACT_ADDRESS"
echo "EPOCHS addr:     $EPOCHS_CONTRACT_ADDRESS"
echo "PROPOSALS addr:  $PROPOSALS_CONTRACT_ADDRESS"
echo
echo "Replace hardcoded contract addresses"

if [ ! -d "${ARTIFACTS_DIR}" ] ; then
    mkdir -p "${ARTIFACTS_DIR}"
fi 

for i in `find src -type f -name "*.template.ts"`; do
    echo "Replacing in $i"
    F=$(echo $i | sed 's/\.template//g'| sed 's/src\///g')
    envsubst < $i > "${ARTIFACTS_DIR}/${F}"
done

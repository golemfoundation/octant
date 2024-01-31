#!/usr/bin/env sh

set -ue

NETWORK=${NETWORK:-"localhost"}

NETWORK_TEMPLATE_FILE=${NETWORK_TEMPLATE_FILE:-"./networks.template.json"}
NETWORK_FILE=${NETWORK_FILE:-"./networks.json"}

ARTIFACTS_DIR="./generated"
mkdir -p "${ARTIFACTS_DIR}"


if [ -f "${NETWORK_FILE}" ]; then
    echo "Network file ${NETWORK_FILE} already exists. Skipping its generation..."
    echo

else
    echo "Generating network file ${NETWORK_FILE} from ${NETWORK_TEMPLATE_FILE}"
    echo

    envsubst <$NETWORK_TEMPLATE_FILE >$NETWORK_FILE
fi


export GLM_CONTRACT_ADDRESS=$(jq -r ".${NETWORK}.GLM.address" <$NETWORK_FILE)
export EPOCHS_CONTRACT_ADDRESS=$(jq -r ".${NETWORK}.Epochs.address" <$NETWORK_FILE)
export PROPOSALS_CONTRACT_ADDRESS=$(jq -r ".${NETWORK}.Proposals.address" <$NETWORK_FILE)

echo "Network:         $NETWORK"
echo "GLM addr:        $GLM_CONTRACT_ADDRESS"
echo "EPOCHS addr:     $EPOCHS_CONTRACT_ADDRESS"
echo "PROPOSALS addr:  $PROPOSALS_CONTRACT_ADDRESS"
echo
echo "Replace hardcoded contract addresses"

for i in `find src -type f -name "*.template.ts"`; do
    echo "Replacing in $i"
    F=$(echo $i | sed 's/\.template//g'| sed 's/src\///g')
    envsubst < $i > "${ARTIFACTS_DIR}/${F}"
done

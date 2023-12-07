#!/usr/bin/env sh

set -ueo pipefail

exec /usr/local/bin/anvil --host 0.0.0.0 \
  --chain-id "${CHAIN_ID}" \
  --gas-limit "${GAS_LIMIT}" \
  --mnemonic "${MNEMONIC}" \
  --block-time "${BLOCK_TIME:-5}" \
  $@ 

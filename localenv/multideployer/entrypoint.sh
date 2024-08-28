#!/usr/bin/env sh

set -ueo pipefail

export LOCAL_RPC_URL=${RPC_URL}
export PORT=${PORT:-8022}

wait_for_rpc(){
    curl  --retry-connrefused --retry 10 --retry-delay 1 \
          -s -X POST "${RPC_URL}" \
          -H "Content-Type: application/json" \
          --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
}

echo ""
echo "waiting for anvil RPC..."
wait_for_rpc
echo ""
echo "anvil is ready!"

exec python3 /app/server.py

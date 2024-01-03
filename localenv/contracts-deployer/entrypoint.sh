#!/usr/bin/env sh

set -ueo pipefail

export LOCAL_RPC_URL=${RPC_URL}
export PORT=${PORT:-8546}

wait_for_rpc(){
    curl  --retry-connrefused --retry 10 --retry-delay 1 \
      -s -X POST "${RPC_URL}" \
      -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'  
}

wait_for_rpc

./entrypoint.sh ${NETWORK} ./localhost-contracts

echo Deployed contracts ...

### prepare env

echo Preparing deployemnt ...
yarn  prepare-local-test-env

### setup simple http server that serves addresses of contracts 
echo Serving contracts addresses ...

while true ; do echo -e "HTTP/1.1 200 OK\n\n$(cat ./localhost-contracts)" | nc -l -p ${PORT} 1>/dev/null ; done
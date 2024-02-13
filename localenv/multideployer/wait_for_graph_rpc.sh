#!/usr/bin/env bash

set -ueo pipefail

SUBGRAPH_ENDPOINT=${1-"http://127.0.0.1:8000/subgraphs/name/octant"}

# Please note that curl will report success after graph is up.
# This command does not check for subgraph status!
curl  --retry-connrefused --retry 20 --retry-delay 1 \
      -s -X POST $SUBGRAPH_ENDPOINT \
      -H "Content-Type: application/json" \
      --data '{"query":"{\n  epoches {\n    id\n  }\n}","variables":null,"extensions":{"headers":null}}'
echo "Done waiting for graph RPC"

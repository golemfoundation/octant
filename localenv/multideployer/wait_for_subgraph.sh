#!/usr/bin/env bash

set -ueo pipefail

export SUBGRAPH_ENDPOINT=${1-"http://127.0.0.1:8000/subgraphs/name/octant"}

function retry {
    CONTINUE=1
    while : ; do
        set -x
        curl  \
            -s \
            -X POST "$SUBGRAPH_ENDPOINT" \
            -H "Content-Type: application/json" \
            --data-raw '{"query":"{\n  epoches {\n    id\n  }\n}","variables":null,"extensions":{"headers":null}}' \
            | jq -e '.data.epoches'
        CONTINUE=$?
        set +x
        if [ $CONTINUE -eq 0 ]; then break; fi
        sleep 1
    done
}

export -f retry

set +e
timeout 20 bash -c retry

RESULT=$?

if [ $RESULT -eq 124 ]; then
    echo "Waiting for subgraph readiness timeouted."
    exit 1
fi
echo "Done waiting for subgraph readiness. Status OK."

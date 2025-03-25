#!/usr/bin/env bash

## Wait for application to deploy

set -e

# timeout    (runs in the foreground on busybox)
#   -s TERM      signal to send after timeout
#   900          number of seconds until timeout
#   bash -c '..' the command to run

timeout --foreground -s TERM 1800 bash -c \
    'until bash $CI_PROJECT_DIR/ci/argocd/is_app_deployed.sh; [ $? -eq 0 ]; do\
    echo "[-] Waiting for ${0}" app to deploy && sleep 10;\
    done' $DEPLOYMENT_ID

echo "[+] $DEPLOYMENT_ID is UP"


#!/usr/bin/env bash

set -e
pushd subgraph || exit 1

yarn install --cache-folder .yarn --non-interactive --frozen-lockfile

popd

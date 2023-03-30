#!/usr/bin/env bash

set -e
pushd subgraph || exit 1

yarn install --cache-folder .yarn --non-interactive --frozen-lockfile
cp networks.template.json networks.json
yarn codegen
yarn build:local

popd

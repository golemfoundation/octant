#!/usr/bin/env bash

set -e
pushd coin-prices-server || exit 1

yarn install --cache-folder .yarn --non-interactive --frozen-lockfile
yarn build

popd

#!/usr/bin/env bash

set -e
pushd contracts-v1 || exit 1

yarn install --cache-folder .yarn --non-interactive --frozen-lockfile
yarn compile

popd

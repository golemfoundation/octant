#!/usr/bin/env bash

set -ex
pushd backend || exit 1

poetry config virtualenvs.in-project true
poetry install --no-interaction --no-ansi -v --with dev --without prod

popd

#!/usr/bin/env sh
# Docker entrypoint for backend-apitest for both CI and local execution
set -ex

poetry run pytest -s --onlyapi

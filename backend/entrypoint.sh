#!/usr/bin/env sh
# Docker entrypoint for CI
set -ex

poetry run flask db upgrade
poetry run flask --app startup run --host 0.0.0.0 --port 5000

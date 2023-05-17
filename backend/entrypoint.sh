#!/usr/bin/env sh
# Docker entrypoint for CI
set -ex

poetry run flask db upgrade
poetry run python3 startup.py

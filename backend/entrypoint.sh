#!/usr/bin/env sh
# Docker entrypoint for CI
set -ex

poetry run flask db upgrade
poetry run gunicorn -c gunicorn_config.py startup:app

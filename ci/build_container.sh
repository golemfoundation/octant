#!/usr/bin/env sh

set -e

if [ $# -ne 1 ]; then
  >&2 echo "Usage:"
  >&2 echo "$0 [container_image]"
  exit 1
fi

SERVICE=$1

if [ ! -f "ci/Dockerfile.${SERVICE}" ]; then
  >&2 echo "Dockerfile does not exits"
  exit 2
fi

if [ ! -d "$SERVICE" ]; then
  >&2 echo "Service directory does not exists"
  exit 3
fi

echo "Building image '$SERVICE'"
docker build -t "$SERVICE" -f "ci/Dockerfile.$SERVICE" "$SERVICE"

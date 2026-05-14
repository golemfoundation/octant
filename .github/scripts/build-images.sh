#!/usr/bin/env bash
# Builds and pushes service images, then the multideployer image.
#
# Required env:
#   IMAGE_REGISTRY   destination registry path (host/project/repo)
# Optional env:
#   IMAGE_TAG        tag to apply (default: current HEAD sha)
#   SERVICES         space-separated subset (default: all five services)
#   DOCKER_BUILD_OPTS extra args passed to `docker buildx build`

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

: "${IMAGE_REGISTRY:?set IMAGE_REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse HEAD)}"
SERVICES="${SERVICES:-contracts-v1 coin-prices-server client subgraph backend}"
DOCKER_BUILD_OPTS="${DOCKER_BUILD_OPTS:-}"

build_and_push() {
  local svc="$1" ctx="$2" dockerfile="$3"
  echo ">> ${svc}:${IMAGE_TAG}"
  # shellcheck disable=SC2086
  docker buildx build \
    --push \
    --tag "${IMAGE_REGISTRY}/${svc}:${IMAGE_TAG}" \
    --file "$dockerfile" \
    $DOCKER_BUILD_OPTS \
    "$ctx"
}

for svc in $SERVICES; do
  build_and_push "$svc" "${ROOT}/${svc}" "${ROOT}/ci/Dockerfile.${svc}"
done

# Multideployer pulls contracts-v1 and subgraph as base layers.
TMP_DOCKERFILE="$(mktemp)"
trap 'rm -f "$TMP_DOCKERFILE"' EXIT
sed \
  -e "s|_CONTRACTS_IMAGE_PLACEHOLDER_|${IMAGE_REGISTRY}/contracts-v1:${IMAGE_TAG}|g" \
  -e "s|_SUBGRAPH_IMAGE_PLACEHOLDER_|${IMAGE_REGISTRY}/subgraph:${IMAGE_TAG}|g" \
  "${ROOT}/ci/Dockerfile.multideployer" >"$TMP_DOCKERFILE"

build_and_push "multideployer" "${ROOT}/localenv/multideployer" "$TMP_DOCKERFILE"

echo ">> done. tag: ${IMAGE_TAG}"

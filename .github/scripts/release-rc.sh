#!/usr/bin/env bash
# Builds images at HEAD and bumps the image tag in the gitops repo.
#
# Required env:
#   IMAGE_REGISTRY        destination registry path (host/project/repo)
#   GITOPS_REMOTE         clone URL of the gitops repo (with auth, e.g. ssh
#                         or https with credential helper / embedded PAT)
# Optional env:
#   IMAGE_TAG             tag to apply (default: current HEAD sha)
#   GITOPS_BRANCH         default: github/octant-release-candidate
#   GITOPS_VALUES_FILE    default: mainnet/octant-image.values.yaml
#   SKIP_BUILD            set to 1 to skip the image build step
#
# Requires: docker, git, python-yq (kislyuk/yq, NOT mikefarah/yq).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

: "${IMAGE_REGISTRY:?set IMAGE_REGISTRY}"
: "${GITOPS_REMOTE:?set GITOPS_REMOTE (clone URL with auth)}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse HEAD)}"
GITOPS_BRANCH="${GITOPS_BRANCH:-github/octant-release-candidate}"
GITOPS_VALUES_FILE="${GITOPS_VALUES_FILE:-mainnet/octant-image.values.yaml}"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  IMAGE_REGISTRY="$IMAGE_REGISTRY" IMAGE_TAG="$IMAGE_TAG" \
    bash "${ROOT}/.github/scripts/build-images.sh"
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --depth 1 -b "$GITOPS_BRANCH" "$GITOPS_REMOTE" "$WORK"
cd "$WORK"

yq -y -i -e ".[].value.value = \"$IMAGE_TAG\"" "$GITOPS_VALUES_FILE"

if git diff --quiet -- "$GITOPS_VALUES_FILE"; then
  echo ">> no change; tag already $IMAGE_TAG"
  exit 0
fi

git add "$GITOPS_VALUES_FILE"
git -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email)}" \
    -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name)}" \
    commit -m "octant: set image tag to $IMAGE_TAG"
git push origin "$GITOPS_BRANCH"

echo ">> released ${IMAGE_TAG} to ${GITOPS_BRANCH}"

#!/usr/bin/env bash
# Dispatches the production release workflow in the downstream pipelines repo.
# This was the only thing the old tag-triggered workflow did.
#
# Args:
#   $1   tag (e.g. v1.2.3); default: a v* tag pointing at HEAD
#
# Required env:
#   PIPELINES_REPO       owner/repo of the pipelines repository
# Optional env:
#   PIPELINES_WORKFLOW   default: deploy-prod.yml
#   PIPELINES_REF        default: master
#
# Auth: gh CLI must be authenticated with a token that can dispatch
# workflows on PIPELINES_REPO (gh auth login, or GH_TOKEN env).

set -euo pipefail

: "${PIPELINES_REPO:?set PIPELINES_REPO (owner/repo)}"
PIPELINES_WORKFLOW="${PIPELINES_WORKFLOW:-deploy-prod.yml}"
PIPELINES_REF="${PIPELINES_REF:-master}"

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  TAG="$(git tag --points-at HEAD | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n1 || true)"
fi
if [[ -z "$TAG" ]]; then
  echo "no v<x>.<y>.<z> tag at HEAD; pass tag as argument" >&2
  exit 1
fi

GIT_REF="$(git rev-parse "$TAG")"

gh workflow run "$PIPELINES_WORKFLOW" \
  --repo "$PIPELINES_REPO" \
  --ref "$PIPELINES_REF" \
  --field "image_tag=$TAG" \
  --field "git_ref=$GIT_REF"

echo ">> dispatched ${PIPELINES_WORKFLOW} (tag=${TAG} ref=${GIT_REF})"

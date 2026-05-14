# Operator scripts

Manual replacements for the (decommissioned) GitHub Actions release flows.
Intended to be run by an admin from a workstation that already has cloud and
registry credentials configured.

## Prerequisites

- `docker` with buildx (and the destination registry already authenticated,
  e.g. `gcloud auth configure-docker <host>`)
- `git`
- `gh` CLI (only for `release-prod.sh`)
- `yq` from the `kislyuk/yq` package, i.e. the Python wrapper around `jq`
  (`pipx install yq`). The mikefarah `yq` is **not** compatible.
- Network access to whatever base-image mirror the Dockerfiles reference.
  Build-time mirror substitutions, if needed, are out of scope of these
  scripts; edit the Dockerfile or pre-pull/retag locally.

## Scripts

### `build-images.sh`

Builds and pushes all service images plus the multideployer image.

| var | required | default |
| --- | --- | --- |
| `IMAGE_REGISTRY` | yes | — |
| `IMAGE_TAG` | no | `git rev-parse HEAD` |
| `SERVICES` | no | `contracts-v1 coin-prices-server client subgraph backend` |
| `DOCKER_BUILD_OPTS` | no | (empty) |

Example:

```sh
IMAGE_REGISTRY=host/project/repo IMAGE_TAG=abc123 \
  bash .github/scripts/build-images.sh
```

### `release-rc.sh`

Builds images at HEAD, then clones the gitops repo, bumps the image tag in
the values file, and pushes.

| var | required | default |
| --- | --- | --- |
| `IMAGE_REGISTRY` | yes | — |
| `GITOPS_REMOTE` | yes | — (clone URL with auth) |
| `IMAGE_TAG` | no | `git rev-parse HEAD` |
| `GITOPS_BRANCH` | no | `github/octant-release-candidate` |
| `GITOPS_VALUES_FILE` | no | `mainnet/octant-image.values.yaml` |
| `SKIP_BUILD` | no | `0` (set to `1` to reuse an existing tag) |

The gitops remote needs to be a URL the operator can push to. Easiest path
is SSH (`git@…:org/repo.git`) with the operator's key, or HTTPS with the
local credential helper.

After the push, verify the rollout from the ArgoCD dashboard or `kubectl`.

### `release-prod.sh`

Dispatches the production release workflow in the downstream pipelines repo.
The pipelines repo owns the actual production rollout; this script just
fires the trigger.

| arg/var | required | default |
| --- | --- | --- |
| `$1` (tag) | no | a `v<x>.<y>.<z>` tag pointing at HEAD |
| `PIPELINES_REPO` | yes | — (`owner/repo`) |
| `PIPELINES_WORKFLOW` | no | `deploy-prod.yml` |
| `PIPELINES_REF` | no | `master` |

`gh` needs a token with workflow-dispatch permission on `PIPELINES_REPO`
(`gh auth login --scopes workflow`, or export `GH_TOKEN`).

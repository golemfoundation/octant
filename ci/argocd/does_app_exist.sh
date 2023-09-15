#!/usr/bin/env bash

## Checks whether specific DEPLOYMENT_ID is present on Argo's app list in "octant" project namespace
#
# Returns exit code 0 on success, 4 on failure

set -e

curl -s -L \
	-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	-H "Content-type: application/json" ${ARGOCD_URL}/api/v1/applications \
	| jq -e '.items[] | select(.spec.project == "octant") | select(.spec.destination.namespace == "'$DEPLOYMENT_ID'")' \
	> /dev/null

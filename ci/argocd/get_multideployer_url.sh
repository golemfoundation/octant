#!/usr/bin/env bash

## Returns the multideployer rpc url used in the environment and healthchecks

set -e

URL=$(curl -s -H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?namespace=${DEPLOYMENT_ID}&resourceName=multideployer-fake&version=v1&kind=Ingress&group=networking.k8s.io" \
	| jq -r .manifest | jq -r '.spec.rules[0].host')

timeout --foreground -s TERM 300 bash -c \
    'until [[ "$(dig +short -t A ${0}.)" != "" ]]; do\
    >&2 echo "[-] Waiting for ${0} nslookup" && sleep 10;\
    done' $URL

echo $URL

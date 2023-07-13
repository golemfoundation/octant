#!/usr/bin/env bash

## Returns the web-client url used in the environment and healthchecks

curl -s -H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?namespace=${DEPLOYMENT_ID}&resourceName=web-client-fake&version=v1&kind=Ingress&group=networking.k8s.io" \
	| jq -r .manifest | jq -r '.spec.rules[0].host'

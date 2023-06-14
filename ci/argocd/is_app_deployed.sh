#!/usr/bin/env bash

## Returns "true" (string) if the application status reported by Argo is Healthy and Synced

curl -L -s -H "Authorization: Bearer $ARGOCD_ACCESS_TOKEN" \
		${ARGOCD_URL}/api/v1/applications/$DEPLOYMENT_ID \
	 | jq '[.status.sync.status, .status.health.status] == ["Synced", "Healthy"]'

#!/usr/bin/env bash

set -exa

ACTION=$1

ARGO_REPOSITORY="https://wildland-bot:${HOUSEKEEPER_CI_TOKEN}@gitlab.com/golemfoundation/devops/iac/k8s/wildland-k8s-devops.git"
ARGO_REPOSITORY_BRANCH="github/octant-ci-cd"

set +a

# Move blocks 5 minutes in the past to make sure we start from epoch 1 and not accidently from epoch 2

export BLOCK_NUMBER=$(echo $BLOCK_NUMBER | python3 -c "print(max(0, int(input()) - 25))")

## ArgoCD repository commit

gpg --import <(echo $HOUSEKEEPER_GPG_KEY | base64 -d)
git config --global user.name "Wildland Housekeeper"
git config --global user.email "$HOUSEKEEPER_EMAIL"
git config --global user.signingkey $HOUSEKEEPER_GPG_KEY_ID

GIT_DIR=`mktemp -d`
git clone --depth=10 -b $ARGO_REPOSITORY_BRANCH $ARGO_REPOSITORY $GIT_DIR

pushd $GIT_DIR
OCTANT_APP_DIR=octant/applications

if [[ "$DEPLOYMENT_TYPE" == "e2e" && "$ACTION" == "create" ]]; then
	if [ -f $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml ]; then
		# If this is E2E app deployment, but it's already found, it likely means that it is a leftover
		# from an unfinished E2E job.
		# Remove it first before moving on.

		git rm -f $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml
		git commit -S -m "Removed Stale E2E Octant deployment file for $DEPLOYMENT_ID at $(date +%Y-%m-%d)"
		git push

		timeout --foreground -s TERM 120 bash -c \
	    'while bash $CI_PROJECT_DIR/ci/argocd/does_app_exist.sh; [ $? -eq 0 ]; do\
	    echo "[-] Waiting for ${0}" app to be destroyed && sleep 10;\
	    done' $DEPLOYMENT_ID

	echo "[+] $DEPLOYMENT_ID is GONE"
	fi
fi

if [[ "$ACTION" == "create" ]]; then
	# Get rid of octant app application source from the Argo app file.
	# We only want anvil at this point

	cat $CI_PROJECT_DIR/ci/argocd/templates/octant-application.yaml | envsubst | yq "del(.spec.sources[0])" > $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml

	git add $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml
	git commit -S -m "Added Octant Anvil deployment file for $DEPLOYMENT_ID branch at $(date +%Y-%m-%d)" || true
	git push

	sleep 10 # Wait for Argo to pickup the latest deployment
elif [[ "$ACTION" == "update" ]]; then

	if [[ "$NETWORK_NAME" == "local" || "$NETWORK_NAME" == "localhost" ]]; then
		if [[ "$WEB_CLIENT_REPLICAS" != "0" ]]; then
			export FRONTEND_RPC_URL; FRONTEND_RPC_URL=https://$(bash $CI_PROJECT_DIR/ci/argocd/get_rpc_url.sh)
		fi
		export BACKEND_RPC_URL=http://anvil:8545
	else
		# This will make webclient use default (wagmi) endpoint
		export FRONTEND_RPC_URL=""
		export BACKEND_RPC_URL=https://geth.wildland.dev
	fi

	# Substitute Argo Octant app env values
	cat $CI_PROJECT_DIR/ci/argocd/templates/octant-application.yaml | envsubst > $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml

	set +e
	bash "${CI_PROJECT_DIR}/ci/argocd/does_app_exist.sh"
	APP_EXISTS=$?
	set -e

	git add $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml
	git commit -S -m "Added Octant App deployment file for $DEPLOYMENT_ID branch at $(date +%Y-%m-%d)" || true
	git push

	sleep 10 # Wait for Argo to pickup the latest deployment

	if [[ "$APP_EXISTS" == "0" && "$REDEPLOY_SUBGRAPH" == "true" ]]; then
		# These are needed only in MR envs as E2E are one-offs and UATs are persistent
		# There's no way for Argo to declaratively force resources to be recreated
		# we thus use a hack to delete resources if they exist.
		#
		# ref
		# https://github.com/argoproj/gitops-engine/issues/414
		# https://github.com/argoproj/argo-cd/issues/5882
		#
		curl -s -X DELETE \
			-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
			-H "Content-type: application/json" \
			"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=backend-db&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=backend-db&version=v1&kind=StatefulSet&group=apps&force=true&orphan=false"
		curl -s -X DELETE \
			-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
			-H "Content-type: application/json" \
			"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=graph-db&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=graph-db&version=v1&kind=StatefulSet&group=apps&force=true&orphan=false"
		curl -s -X DELETE \
			-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
			-H "Content-type: application/json" \
			"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=graph-node&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=graph-node&version=v1&kind=StatefulSet&group=apps&force=true&orphan=false"
		curl -s -X DELETE \
			-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
			-H "Content-type: application/json" \
			"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=graph-healthchecker&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=graph-healthchecker&version=v1&kind=Deployment&group=apps&force=true&orphan=false"
	fi

	# Jobs are always immutable, so we have to kill the old one
	# This shouldn't an issue for master/uat as the subgraphs are not changing often
	curl -s -X DELETE \
			-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
			-H "Content-type: application/json" \
			"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=graph-deploy&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=graph-deploy&version=v1&kind=Job&group=batch&force=true&orphan=false"

	curl -s -X POST \
		-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
		-H "Content-type: application/json" \
		"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/sync"

	# I'm leaving the previous hack for the time being in case it has to be used again
	#
	# sleep 10 && curl -s -X POST \
	# 	-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	# 	-H "Content-type: application/json" \
	# 	--data-raw '{"appNamespace":"argocd","prune":true,"dryRun":false,"strategy":{"hook":{"force":true}},"syncOptions":{"items":["Replace=true"]}}' \
	# 	"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/sync"

else # assuming $ACTION =~ (delete|destroy)
	FILE="${OCTANT_APP_DIR}/${DEPLOYMENT_ID}-app.yaml"

	if [ -f "${FILE}" ]; then
		git rm -f "${FILE}"
		git commit -S -m "Removed Octant deployment file for ${DEPLOYMENT_ID} branch at $(date +%Y-%m-%d)"
		git push
	fi
fi

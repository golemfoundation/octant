#!/usr/bin/env bash

set -exa

ACTION=$1

ARGO_REPOSITORY="https://wildland-bot:${HOUSEKEEPER_CI_TOKEN}@gitlab.com/wildland/devops/iac/k8s/wildland-k8s-devops.git"
ARGO_REPOSITORY_BRANCH="octant"

# sourcing Old contracts
source $CI_PROJECT_DIR/ci/argocd/templates/old-contracts/all.env

# sourcing New contracts (prod, uat, etc) -- this functionality is tba, for now its not used
if [[ "$ENV_FILE" ]]; then
	source $CI_PROJECT_DIR/ci/argocd/templates/new-contracts/$ENV_FILE
fi

set +a

## ArgoCD repository commit

gpg --import <(echo $HOUSEKEEPER_GPG_KEY | base64 -d)
git config --global user.name "Wildland Housekeeper"
git config --global user.email "$HOUSEKEEPER_EMAIL"
git config --global user.signingkey $HOUSEKEEPER_GPG_KEY_ID

GIT_DIR=`mktemp -d`
git clone -b $ARGO_REPOSITORY_BRANCH $ARGO_REPOSITORY $GIT_DIR

pushd $GIT_DIR
OCTANT_APP_DIR=octant/applications

cat $CI_PROJECT_DIR/ci/argocd/templates/octant-application.yaml | envsubst > $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml

if [[ "$ACTION" == "create" ]]; then
	git add $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml
	git commit -S -m "Added Octant deployment file for $DEPLOYMENT_ID branch at $(date +%Y-%m-%d)" || true
	git push
	# There's no way for Argo to declaratively force resources to be recreated
	# we thus use a hack to sync with force+replace with a delay so that argo
	# has enough time to pick up changes from latest Gitlab's webhook
	#
	# ref
	# https://github.com/argoproj/gitops-engine/issues/414
	# https://github.com/argoproj/argo-cd/issues/5882
	#
	sleep 10
	curl -s -X DELETE \
		-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
		-H "Content-type: application/json" \
		"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=deploy-contracts&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=deploy-contracts&version=v1&kind=Job&group=batch&force=true&orphan=false"
	curl -s -X DELETE \
		-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
		-H "Content-type: application/json" \
		"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=graph-deploy&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=graph-deploy&version=v1&kind=Job&group=batch&force=true&orphan=false"
	curl -s -X POST \
		-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
		-H "Content-type: application/json" \
		"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/sync"
	sleep 30
	# curl -s -X DELETE \
	# 	-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	# 	-H "Content-type: application/json" \
	# 	"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/resource?name=octant&appNamespace=argocd&namespace=${DEPLOYMENT_ID}&resourceName=octant&version=v1&kind=Secret&group=&force=true&orphan=false"

	# I'm leaving the previous hack for the time being in case it has to be used again
	#
	# sleep 10 && curl -s -X POST \
	# 	-H "Authorization: Bearer ${ARGOCD_ACCESS_TOKEN}" \
	# 	-H "Content-type: application/json" \
	# 	--data-raw '{"appNamespace":"argocd","prune":true,"dryRun":false,"strategy":{"hook":{"force":true}},"syncOptions":{"items":["Replace=true"]}}' \
	# 	"${ARGOCD_URL}/api/v1/applications/${DEPLOYMENT_ID}/sync"

else # assuming $ACTION =~ (delete|destroy)
	git rm -f $OCTANT_APP_DIR/$DEPLOYMENT_ID-app.yaml
	git commit -S -m "Removed Octant deployment file for $DEPLOYMENT_ID branch at $(date +%Y-%m-%d)"
	git push
fi

popd

if [[ "$ACTION" == "create" ]]; then
	## Wait for application to deploy

	# timeout    (runs in the foreground on busybox)
	#   -s TERM      signal to send after timeout
	#   900          number of seconds until timeout
	#   bash -c '..' the command to run

	timeout --foreground -s TERM 900 bash -c \
	    'while [[ $(bash $CI_PROJECT_DIR/ci/argocd/is_app_deployed.sh) != "true" ]]; do\
	    echo "[-] Waiting for ${0}" app to deploy && sleep 10;\
	    done' $DEPLOYMENT_ID

	echo "[+] $DEPLOYMENT_ID is UP"
fi

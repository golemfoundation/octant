#!/usr/bin/env bash

TYPE=$1

if [[ $CI_MERGE_REQUEST_IID ]]; then
	PREFIX="mr-${CI_MERGE_REQUEST_IID}"
else
	PREFIX="app-${CI_PIPELINE_ID}"
fi

export EPOCH_DURATION=300
export DECISION_WINDOW=120

if [[ "$TYPE" == "e2e" ]]; then
	## E2E tests deployment
	## 	contracts are always deployed
	## 	the environment will be removed when after E2E tests are finished
	export DEPLOYMENT_ID="${PREFIX}-e2e"
	export DEPLOY_CONTRACTS="true"
elif [[ "$TYPE" =~ ^(prod|uat)$ ]]; then
	## PROD/UAT/other-persistent-envs
	## 	contracts are never deployed, ie. uses pre-defined set
	export DEPLOYMENT_ID="${TYPE}"

	## At some point we will introduced pre-deployed set of contracts but for
	## the time being we stick with always deployed on each and every environment
	# export ENV_FILE="${TYPE}.env"
	# export DEPLOY_CONTRACTS= # intentionally empty! (don't use "false", "0" etc.)
	export DEPLOY_CONTRACTS="true"
else # (assume mr/app)
	## Regular app deployment
	## 	contracts are always deployed
	## 	the environment will be removed when MR is closed
	export DEPLOYMENT_ID="${PREFIX}"
	export DEPLOY_CONTRACTS="true"
fi

#!/usr/bin/env sh

set -ueo pipefail

export BACKEND_URL=${BACKEND_URL:-http://backend:5000}
export SNAPSHOT_INTERVAL=${SNAPSHOT_INTERVAL:-10}

log(){
  echo "$(date "+%Y-%m-%d %H:%M:%S") | " $@
}

err(){
  text=$(log $@)
  echo "${text}" >2
}

trigger_snapshot(){
  snapshot_type=${1}

  log Running ${snapshot_type} epoch snapshot
  
  r=$(curl -s -X 'POST' \
    "${BACKEND_URL}/snapshots/${snapshot_type}" \
    -H 'Accept: application/json')
  if [[ -z "${r}" ]]; then
    log Nothing to be done
  elif [[ "$( echo "${r}" | jq -r .epoch )" == "null" ]]; then
    err "Could not finish snapshot: ${r}"
  else
    log "Finished ${snapshot_type} snapshot: $( echo "${r}" | jq -r .epoch)"
  fi
  
}

log Waiting for backend
curl  --retry-connrefused --retry 120 --retry-delay 5 -s \
  -X 'GET' "${BACKEND_URL}/info/healthcheck" \
  -H 'Accept: application/json' 


while true ; do 
  sleep "${SNAPSHOT_INTERVAL}"

  trigger_snapshot pending
  trigger_snapshot finalized

done
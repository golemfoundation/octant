#!/usr/bin/env bash

set -ueo pipefail

SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
OCTANT_ROOT=$(readlink -f "${SCRIPT_DIR}/../..")

DOCKER_IMAGE_PREFIX="octant"
DOCKER_TAG="latest"

create_tmp_dockerfile(){
  service="${1}"
  tmp_dockerfile=$(mktemp -t "octant-dockerfile-${service}.XXXXXXXX")

  sed "s/local-docker-registry.wildland.dev\///g" "${OCTANT_ROOT}/ci/Dockerfile.${service}" >$tmp_dockerfile

  echo $tmp_dockerfile
}

build_image(){

  image=$1
  dockerfile=$2
  context_dir=$3

  image_id=$(docker build -q --tag "${DOCKER_IMAGE_PREFIX}/${image}:${DOCKER_TAG}" -f ${dockerfile} "${context_dir}")

  echo "Created ${image} image ${image_id}" 
}

build_anvil(){
  echo Building anvil image ... 

  build_image anvil "${OCTANT_ROOT}/localenv/anvil/Dockerfile" "${OCTANT_ROOT}/localenv/anvil" 

  echo "Finished building anvil image!"
}

build_contracts_base(){
  echo Building contracts images ... 

  dockerfile=$(create_tmp_dockerfile contracts-v1)
  build_image contracts ${dockerfile} "${OCTANT_ROOT}/contracts-v1"

  echo Finished building contracts images!

}

build_subgraph_base(){
  echo Building subgraph images ... 

  dockerfile=$(create_tmp_dockerfile subgraph)
  build_image subgraph ${dockerfile} "${OCTANT_ROOT}/subgraph"

  echo Finished building subgraph image!
}

build_backend(){
  
  echo Building backend image ... 

  dockerfile=$(create_tmp_dockerfile backend)
  build_image backend ${dockerfile} "${OCTANT_ROOT}/backend"

  echo Finished building backend image!
}

build_client(){
  
  echo Building client image ... 

  dockerfile=$(create_tmp_dockerfile client)
  build_image client ${dockerfile} "${OCTANT_ROOT}/client"

  echo Finished building client image!
}


build_contracts_deployer(){
  echo Building contracts deployer image ...

  build_image contracts-deployer "${OCTANT_ROOT}/localenv/contracts-deployer/Dockerfile" "${OCTANT_ROOT}/localenv/contracts-deployer"

  echo Finished building contracts deployer image!
}

build_subgraph_deployer(){
  echo Building subgraph deployer image ...

  build_image subgraph-deployer "${OCTANT_ROOT}/localenv/subgraph-deployer/Dockerfile" "${OCTANT_ROOT}/localenv/subgraph-deployer"

  echo Finished building subgraph deployer image!
}

build_contracts(){
  build_contracts_base
  build_contracts_deployer
}

build_subgraph(){
  build_subgraph_base
  build_subgraph_deployer
}

### Localenv tooling
build_anvil &

### PROD-like images
build_subgraph &
build_contracts &
build_backend &
build_client &

wait

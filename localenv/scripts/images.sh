#!/usr/bin/env bash

set -ueo pipefail

SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
OCTANT_ROOT=$(readlink -f "${SCRIPT_DIR}/../..")

DOCKER_IMAGE_PREFIX="octant"
DOCKER_TAG="latest"

create_tmp_dockerfile(){
  service="${1}"
  tmp_dockerfile=$(mktemp -t "octant-dockerfile-${service}.XXXXXXXX")

  sed "s/local-docker-registry.wildland.dev:80\///g" "${OCTANT_ROOT}/ci/Dockerfile.${service}" >$tmp_dockerfile

  echo $tmp_dockerfile
}

build_image(){

  image=$1
  dockerfile=$2
  context_dir=$3
  additional_params=${4:-""}

  image_id=$(docker build ${additional_params} -q --tag "${DOCKER_IMAGE_PREFIX}/${image}:${DOCKER_TAG}" -f ${dockerfile} "${context_dir}")

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
  echo Building backend-base image ...
  dockerfile=$(create_tmp_dockerfile backend)
  build_image backend-base ${dockerfile} "${OCTANT_ROOT}/backend" "--platform linux/amd64"
  echo Finished building backend-base image!

  echo Building backend image ...
  build_image backend "${OCTANT_ROOT}/localenv/backend/Dockerfile" "${OCTANT_ROOT}/localenv/backend" "--platform linux/amd64"
  echo Finished building backend image!

  echo Building backend-apitest image ...
  build_image backend-apitest "${OCTANT_ROOT}/localenv/backend-apitest/Dockerfile" "${OCTANT_ROOT}/localenv/backend-apitest" "--platform linux/amd64"
  echo Finished building backend-apitest image!
}

build_client(){

  echo Building client image ...

  dockerfile=$(create_tmp_dockerfile client)
  build_image client ${dockerfile} "${OCTANT_ROOT}/client"

  echo Finished building client image!
}

build_multideployer(){
    build_contracts_base
    build_subgraph_base
    echo Building multideployer image ...

    build_image multideployer "${OCTANT_ROOT}/localenv/multideployer/Dockerfile" "${OCTANT_ROOT}/localenv/multideployer"

    echo Finished building multi image!
}

build_control_plane(){
    echo Building control plane image ...

    build_image control-plane "${OCTANT_ROOT}/localenv/control-plane/Dockerfile" "${OCTANT_ROOT}/localenv/control-plane"

    echo Finished building control plane image!
}

build_snapshotter(){
    echo Building snapshotter image ...

    build_image snapshotter "${OCTANT_ROOT}/localenv/snapshotter/Dockerfile" "${OCTANT_ROOT}/localenv/snapshotter"

    echo Finished building snapshotter image!
}

build_contracts(){
    build_contracts_base
}

build_subgraph(){
    build_subgraph_base
}

SUBSYSTEM=${1:-}
if [ ! -z $SUBSYSTEM ]; then
    build_$SUBSYSTEM
    exit $?
fi

### Localenv tooling
build_control_plane
build_snapshotter
build_anvil
build_multideployer

### PROD-like images
build_contracts
build_subgraph
build_backend
build_client

wait

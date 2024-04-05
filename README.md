# Octant

Octant is a community-driven platform for experiments in decentralized governance.

Developed by the [Golem Foundation](https://golem.foundation/) to test various hypotheses around
user control, voter engagement, and community funding, the platform allows for running various
governance experiments in a real-life environment and rewards user participation with ETH.

Documentation is available [here](https://docs.octant.app/).

---

## Runing development environment

Below is development setup instructions. More documentation, configuration, deployment information
is available in directories of this repository.

For the first build of contracts it is highly recommended to run the following command first (this
step will require
having [configured gcloud docker authentication](#gcloud-docker-images-repository-authentication) or
[local build of anvil's fork](#local-build-of-patched-anvil)):

```bash
yarn localenv:build-anvil
```

Build images with the following command:

```bash
yarn localenv:build-images
````

Run local environment

```sh
yarn localenv:up
```

To stop the environment, simply, run:

```sh
yarn localenv:down
```

Local environemnt is available at [http://octant.localhost:8080](http://octant.localhost:8080) and
at [http://localhost:8080](http://localhost:8080).

*NOTICE:* in order to make it work using octant.localhost domain one should add the following lines
to `/ect/hosts` or `C:\Windows\system32\drivers\etc\hosts` file.

```
127.0.0.1 octant.localhost
127.0.0.1 rpc.octant.localhost
127.0.0.1 graph.octant.localhost
127.0.0.1 backend.octant.localhost
127.0.0.1 client.octant.localhost
```

### Starting web client

Full web client documentation is available [here](client/README.md).

- go to `client` directory
- copy `.env.localenv-template` to `.env`
- Run client `yarn dev`
- Go to [client webpage](http://octant.localhost:5173)

**TL;DR version:**

```shell
cd client
cp .env.localenv-template .env
yarn dev
```

## gcloud docker images repository authentication

Please notice, that for the time being, we are using our own fork of `foundry` (especially `anvil`),
and we have a pre-built image stored at Google Cloud.
In order to configure access to this image one should have `gcloud` configured and then run command:

`$ gcloud auth configure-docker europe-docker.pkg.dev`

## Local build of patched anvil

If you don't have access to Golem Foundation image repository you can build image yourself from
branch `foundry-4129/trace-filter-support` of our `foundry` fork.

```shell
git clone https://github.com/golemfoundation/foundry.git --branch=foundry-4129/trace-filter-support --single-branch
cd foundry
docker build -t europe-docker.pkg.dev/wildland-dev/octant-test/foundry:latest .
```

---

## Contributor Agreement

In order to be able to contribute to any Wildland repository, you will need to agree to the terms of
the [Wildland Contributor Agreement](https://docs.wildland.io/contributor-agreement.html). By
contributing to any such repository, you agree that your contributions will be licensed under
the [GPLv3 License](https://gitlab.com/wildland/governance/octant/-/blob/master/LICENSE).

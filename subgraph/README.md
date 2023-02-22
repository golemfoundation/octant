# Octant subgraph (The Graph)

## Setup

Provide `networks.json` file. You can do it manually, check `networks.template.json` for reference or
deploy new contracts (check [Deployment section in project root's Readme.md file](../README.md#deployment)).
This will generate the file for you.

### Local

If you're doing a local deployment, please be sure to change `hardhat` to `localhost` in the generated
`networks.json` (hardhat-deploy plugin bug - cannot set "localhost" as a default network).
You can run `yarn prepare-local-test-env` from project directory to generate some events subgraph will index.

### Goerli

Also, generated file doesn't contain `startBlock` fields indicating the height on which the graph should
start indexing. it's good to add it if you do `goerli` deployment to make indexing faster. You can set
it to the block before the one where you deployed your contract.

### Client

In order for subgraph to index contracts used by the client ensure that addresses in `subgraph/networks.json` are the same as used in `client/env.ts`.

## Install
```bash
yarn
yarn codegen
```

## Test
```bash
yarn test
```

## Build

### Local
```bash
yarn build:local
```

### Goerli
```bash
yarn build:goerli
```

## Run
ensure that `.env`  file is present. See `.env.template`.

```bash
yarn clean
yarn start
```
## Deploy
### Local
```bash
yarn create-subgraph
yarn deploy:local
```

### Goerli
```bash
yarn create-subgraph
yarn deploy:goerli
```

## Query
Open the following url in your browser `http://127.0.0.1:8000/subgraphs/name/octant/graphql`

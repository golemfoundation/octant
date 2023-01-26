# Hexagon subgraph (The Graph)

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
yarn build-local
```
Be sure to change network in `subgraph.yaml` from `hardhat` to `localhost`

### Goerli
```bash
yarn build-goerli
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
yarn deploy-local
```

### Goerli
```bash
yarn create-subgraph
yarn deploy-goerli
```

## Query
Open the following url in your browser `http://127.0.0.1:8000/subgraphs/name/hexagon/graphql`

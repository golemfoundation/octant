# Hexagon

Golem Foundation's decentralised governance system that will be first rolled out to govern the Wildland project.

## Configuration

ensure that `.env`  file is present. See `.env.template`


## Test
```bash
yarn test
```

## Format and lint
```bash
yarn format
yarn lint
```

## Deployment

### Goerli testnet
```bash
hardhat --network goerli deploy
hardhat --network goerli etherscan-verify --license UNLICENSED
```


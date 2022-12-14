# Hexagon

Golem Foundation's decentralised governance system that will be first rolled out to govern the Wildland project.

## Configuration
ensure that `.env`  file is present. See `.env.template`

## Clean
```bash
yarn clean
```

## Compile
```bash
yarn compile
```

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
yarn deploy:goerli
yarn verify:goerli
```

### zkSync testnet
```bash
yarn deploy:zksync
```
## GLM Faucet (Goerli)
Update `.env` with your private key:
```bash
GOERLI_PRIVATE_KEY=<your private key>
```
Send Test GLM
```bash
npx hardhat --network goerli send-glm --recipient <recipient address>
```



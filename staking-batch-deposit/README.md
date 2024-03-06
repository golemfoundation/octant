# Batch Deposit Contract

This contract enable to deposit to the ETH2 Deposit Contract multiple times in a single transaction.

## Usage

You can test the contract on both goerli/holesky testnet or in your local development environment.

### Test

```
yarn test
```

## Deploy

### Preparations

Define env variables:
```
ETHERSCAN_API_KEY
HOLESKY_RPC_URL
GOERLI_RPC_URL
TESTNET_PRIVATE_KEY
```

### Goerli

```
yarn deploy:goerli
```

### Holesky

```shell
yarn deploy:holesky
```

## Verify

`npx hardhat verify --network <network> <batch_deposit_address> "<deposit_contract_address>" "0"`

### Build batch deposit tx to be executed by multisig

1. Generate a json file with deposit data
   with [staking-deposit-cli](https://github.com/ethereum/staking-deposit-cli)
2. Update `.env` file:
    1. set `BATCH_DEPOSIT_CONTRACT_ADDRESS=<batch deposit contract address>` (optional, if not
       defined then use hardcoded one)
    2. set `DEPOSIT_DATA_FILE=<path to generated deposit data file>`
    3. example:
   ```
   BATCH_DEPOSIT_CONTRACT_ADDRESS=0x31171d6E4b6c08317A0047331e0C2B28b28e5dfe
   DEPOSIT_DATA_FILE=deposit-data.json
   ```
4. Run `yarn build-batch-tx` or `yarn build-batch-yx:goerli` or `yarn build-batch-tx:holesky`
5. Execute the output from your multisig

## Security testing

Refer to https://github.com/crytic/slither

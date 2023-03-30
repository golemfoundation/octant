## Configuration

Ensure that the `.env`  file is present. See `.env.template`.

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

## Documentation
Generate contracts documentation:
```bash
yarn docs
```
Go to `.docs` and open the `index.html` file in your browser.

## Deployment

### Local
In one terminal:
```bash
yarn start-node
```
In second terminal:
```bash
yarn prepare-local-test-env
```
In order to generate reward budget:
```bash
yarn generate-reward
```
Please note that this needs to be run in each epoch you want to have reward budget.

### Goerli testnet
```bash
yarn deploy:goerli
yarn verify:goerli
```

## GLM Faucet (Goerli)
Update `.env` with your private key:
```bash
GOERLI_PRIVATE_KEY=<your private key>
```
Send Test GLM.
```bash
npx hardhat --network goerli send-glm --recipient <recipient address>
```

## Known technical problems

Root `package.json` `yarn postinstall` command replaces `@nomiclabs/hardhat-ethers` with `hardhat-deploy-ethers`. This is due to the fact that the first package, although essential declares different methods for `ethers` than the latter package, causing unexpected type collision.

# Octant

Octant is a community-driven platform for experiments in decentralized governance.

Developed by the [Golem Foundation](https://golem.foundation/) to test various hypotheses around user control, voter engagement, and community funding, the platform allows for running various governance experiments in a real-life environment and rewards user participation with ETH.

Documentation is available [here](https://docs.octant.app/).

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
### root

Root `package.json` `yarn postinstall` command replaces `@nomiclabs/hardhat-ethers` with `hardhat-deploy-ethers`. This is due to the fact that the first package, although essential declares different methods for `ethers` than the latter package, causing unexpected type collision.

### client
Typechain combines responses from contracts so that an array and object are joined together, e.g.:
```
export type AllocationStructOutput = [BigNumber, BigNumber] & {
    allocation: BigNumber;
    proposalId: BigNumber;
};
```
The problem with this approach is that the `react-query` package used for fetching and managing data from contracts does drop the latter object part on all but first after rerender requests. Hence, the remapping of array elements to named variables is required during response parsing phase.

## Contributor Agreement

In order to be able to contribute to any Wildland repository, you will need to agree to the terms of the [Wildland Contributor Agreement](https://docs.wildland.io/contributor-agreement.html). By contributing to any such repository, you agree that your contributions will be licensed under the [GPLv3 License](https://gitlab.com/wildland/governance/octant/-/blob/master/LICENSE).

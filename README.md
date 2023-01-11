# Hexagon

Golem Foundation's decentralised governance system that will be first rolled out to govern the Wildland project.

More about Hexagon [here](https://hexagonapp.notion.site/Hexagon-a-GLM-Governance-Experiment-e098d7ff9d55468db28b8b3584b5959c)

Hexagon frontend: https://wildland.gitlab.io/governance/hexagon/

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

## Documentation
Generate contracts documentation:
```bash
yarn docs
```
Go to `.docs` and open `index.html` file in your browser

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

## Known technical problems
### client
Typechain combines responses from contracts so that array and object are joined together, e.g.:
```
export type AllocationStructOutput = [BigNumber, BigNumber] & {
    allocation: BigNumber;
    proposalId: BigNumber;
};
```
The problem with this approach is that `react-query` package used for fetching and managing data from contracts does drop the latter object part on all but first after rerender requests. Hence, the remapping of array elements to named variables is required during response parsing phase.

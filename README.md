# Octant

Octant is a community-driven platform for experiments in decentralized governance.

Developed by the [Golem Foundation](https://golem.foundation/) to test various hypotheses around user control, voter engagement, and community funding, the platform allows for running various governance experiments in a real-life environment and rewards user participation with ETH.

Documentation is available [here](https://docs.octant.app/).

---

Below is development setup instructions. More documentation, configuration, deployment information is available in directories of this repository.


Prerequisites: please make sure that anvil, jq and envsubst tools are in your PATH. envsubst is packaged in gettext-base in Debian. Anvil is provided by https://github.com/foundry-rs/foundry.

Procedure:

```bash
contracts-v1$ yarn start-node

contracts-v1$ rm -rf deployments/localhost; yarn deploy:localhost

subgraph$ yarn clean

subgraph$ yarn build:localhost

subgraph$ yarn start # if you are running on linux, use yarn start:linux instead and change RPC_PROVIDER to localhost
subgraph$ yarn create-subgraph

subgraph$ yarn deploy:localhost
```

After this step - check graph's console, it should enumerate blocks it has indexed.
For the backend, change .env:

- change EPOCH_0_END and EPOCH_1_END to some low value to ensure backend actually asks the contract
- set contract addresses to ones printed by contract deployment script
- update ETH_RPC_PROVIDER and SUBGRAPH_ENDPOINT

The last step is running backend. To do it natively, do

```bash
backend$ rm dev.db; flask db upgrade; python3 startup.py
```

TODO: write section about using client with local setup.

---

## Contributor Agreement

In order to be able to contribute to any Wildland repository, you will need to agree to the terms of the [Wildland Contributor Agreement](https://docs.wildland.io/contributor-agreement.html). By contributing to any such repository, you agree that your contributions will be licensed under the [GPLv3 License](https://gitlab.com/wildland/governance/octant/-/blob/master/LICENSE).

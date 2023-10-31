## Configuration

Ensure that the `.env`  file is present. See `.env.template`.

### Envs

1. `VITE_NETWORK` sets network used by the application. Supported values are 'Local', 'Mainnet', 'Sepolia'. Whenever different value is set, app uses 'Sepolia' network config.
2. `VITE_JSON_RPC_ENDPOINT`: when provided, app uses first JSON RPC provided with this endpint. When it's not provided, app uses alchemy provider first.
3. `VITE_ARE_CURRENT_EPOCHS_PROJECTS_VISIBLE` when set to 'true' ensures current epoch's projects are visible when allocation window is closed.

`yanr generate-abi-typings` is used to generate typings for proposals ABIs that we have in codebase. In these typings custom adjustments are added, e.g. in some places `string` is wrongly instead of `BigInt`. Linter is also disabled there. Since ABIs do not change, this command doesn't need to rerun.

### Contracts

Client uses 5 contracts. Following are their names and envs which should have their addresses:
1. Deposits (`VITE_DEPOSITS_ADDRESS`).
2. Epochs (`VITE_EPOCHS_ADDRESS`).
3. ERC20 (`VITE_GLM_ADDRESS`).
4. Proposals (`VITE_PROPOSALS_ADDRESS)`.
5. Vault (`VITE_VAULT_ADDRESS`).

Values for all but `VITE_JSON_RPC_ENDPOINT` envs are required. In order to deploy client without Epochs & Vault contracts please use any placeholder value for their envs (e.g. `placeholder`), i.e. `VITE_EPOCHS_ADDRESS=placeholder`.

## Proposals

The app fetches proposals addresses from the contract and their data (name, description, etc.) from IPFS. Current expected schema of proposal coming from IPFS is as follows:

```ts
/**
 * Metadata describing a project proposal for Octant
 */
export interface BackendProposal {
  /**
   * Name of the project proposed for Octant funding
   */
  name: string;
  /**
   * Short description of the project
   */
  introDescription: string;
  /**
   * Detailed description of the project
   */
  description: string;
  /**
   * Profile image of the project (small) 64px
   */
  profileImageSmall: string;
  /**
   * Profile image of the project (medium) 128px
   */
  profileImageMedium?: string;
  /**
   * Profile image of the project (large) 192px
   */
  profileImageLarge?: string;
  /**
   * The version of Backend Proposal schema used to describe this proposal
   */
  version?: string;
  /**
   * Website information
   */
  website: {
    /**
     * Optional label describing website
     */
    label?: string;
    /**
     * URL to the website
     */
    url: string;
  };
}
```

## Codegen

[Codegen](https://the-guild.dev/graphql/codegen) is used to generate GQL typed queries, mutations & subscriptions. Types are fetched from the server on `yarn codegen` command and put in `src/gql` directory, which is commited. It's done so that whenever server is not available starting frontend application is not blocked. When the server becomes more stable or local environment is available, we will not commit `src/gql` directory.

## Packages

1. `@synthetixio/synpress` requests `eth-sig-util@^1.4.2`, which requests `ethereumjs-abi` as a dependency directly from git, breaking container builds. To solve it we could either alter our node image to include git, or add following resolution, which we did:
```bash
"resolutions": {
  "@synthetixio/synpress/**/eth-sig-util": "yarn:@metamask/eth-sig-util@^5.1.0"
}
```
`eth-sig-util` is deprecated in favor of `@metamask/eth-sig-util`. The latter does not require `ethereumjs-abi` at all.
2. `cypress` is resolved to `12.14.0` because of [this issue](https://github.com/cypress-io/code-coverage/issues/667). Issue is resolved, but Cypress Team is on track of some edge cases, as explained [here](https://github.com/cypress-io/code-coverage/issues/667#issuecomment-1609563639). Issue causes our Synpress runs to fail when executing actions in MetaMask.
3.
```json
    "@web3modal/ethereum": "^2.2.2",
    "@web3modal/react": "^2.2.2",
```
Because of [this](https://github.com/cypress-io/cypress/discussions/26853).

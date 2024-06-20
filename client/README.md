## Node version

Use only node:16 because of [problem](https://github.com/Synthetixio/synpress/issues/1071) with e2e tests in synpress.

## Configuration

Ensure that the `.env` file is present. See `.env.template`.

### Environment envs

- `VITE_NETWORK` sets network used by the application. Supported values are 'Local', 'Mainnet', 'Sepolia'. Whenever different value is set, app uses 'Sepolia' network config.
- `VITE_JSON_RPC_ENDPOINT`: when provided, app uses first JSON RPC provided with this endpoint. When it's not provided, app uses alchemy provider first.
- `VITE_ALCHEMY_ID`: Alchemy API key
- `VITE_ARE_CURRENT_EPOCHS_PROJECTS_HIDDEN_OUTSIDE_ALLOCATION_WINDOW` when set to 'true' makes current epoch's projects hidden when allocation window is closed.
- `VITE_IPFS_GATEWAYS` is an array of URLs separated by strings sorted by priority with providers the app should try to fetch the data about projects from. When fetching from the last fails client shows error toast message. Each URL should end with a forward slash (`/`).
- `VITE_SERVER_ENDPOINT`: URL of backend server. URL should end with a forward slash (`/`).
- `VITE_SAFE_ENDPOINT`: URL of Safe API. For Sepolia testnet use `https://safe-transaction-sepolia.safe.global/`, for Mainnet `https://safe-transaction-mainnet.safe.global/`, for local it can be anything because multisig doesn't work on local.

`yarn generate-abi-typings` is used to generate typings for proposals ABIs that we have in codebase. In these typings custom adjustments are added, e.g. in some places `string` is wrongly instead of `BigInt`. Linter is also disabled there. Since ABIs do not change, this command doesn't need to rerun.

### Contract envs

Client uses 5 contracts. Following are their names and envs which should have their addresses:

- Deposits (`VITE_DEPOSITS_ADDRESS`)
- Epochs (`VITE_EPOCHS_ADDRESS`)
- ERC20 (`VITE_GLM_ADDRESS`)
- Projects (`VITE_PROPOSALS_ADDRESS)`
- Vault (`VITE_VAULT_ADDRESS`)

Values for all but `VITE_JSON_RPC_ENDPOINT` envs are required.

In order to deploy client without Epochs & Vault contracts please use any placeholder value for their envs (e.g. `placeholder`), i.e. `VITE_EPOCHS_ADDRESS=placeholder`.

## Projects

The app fetches projects addresses from the contract and their data (name, description, etc.) from IPFS. Current expected schema of proposal coming from IPFS is as follows:

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

1. `cypress` is resolved to `12.17.3` because of [this issue](https://github.com/cypress-io/code-coverage/issues/667). Issue is resolved, but Cypress Team is on track of some edge cases, as explained [here](https://github.com/cypress-io/code-coverage/issues/667#issuecomment-1609563639). Issue causes our Synpress runs to fail when executing actions in MetaMask.

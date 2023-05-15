## Configuration

Ensure that the `.env`  file is present. See `.env.template`.

`VITE_IS_USING_LOCAL_CONTRACTS` sets network used by the application to local environment. Please note that this option does not work currently, so unexpected behavior might occur. Local environment with contracts, server, is not currently operational as per `contracts/README.md`.

`VITE_NETWORK` sets network used by the application. Supported values are 'Goerli' and 'Sepolia' with the latter being default. Whenever different value is set, app sets 'Sepolia' anyway.

`VITE_IS_USING_LOCAL_CONTRACTS` set to `true` overrides `VITE_NETWORK`.

## Proposals

The app fetches proposals addresses from the contract and their data (name, description, etc.) from IPFS. Current expected schema of proposal coming from IPFS is as follows:

```ts
export interface BackendProposal {
  description: string;
  name: string;
  profileImageCID: string;
  website: {
    label?: string;
    url: string;
  };
}
```

## Codegen

[Codegen](https://the-guild.dev/graphql/codegen) is used to generate GQL typed queries, mutations & subscriptions. Types are fetched from the server on `yarn codegen` command and put in `src/gql` directory, which is commited. It's done so that whenever server is not available starting frontend application is not blocked. When the server becomes more stable or local environment is available, we will not commit `src/gql` directory.

## Known technical problems

Typechain combines responses from contracts so that an array and object are joined together, e.g.:
```
export type AllocationStructOutput = [BigNumber, BigNumber] & {
    allocation: BigNumber;
    proposalId: BigNumber;
};
```
The problem with this approach is that the `react-query` package used for fetching and managing data from contracts does drop the latter object part on all but first after rerender requests. Hence, the remapping of array elements to named variables is required during response parsing phase.

## Packages

`@synthetixio/synpress` requests `eth-sig-util@^1.4.2`, which requests `ethereumjs-abi` as a dependency directly from git, breaking container builds. To solve it we could either alter our node image to include git, or add following resolution, which we did:
```bash
"resolutions": {
  "@synthetixio/synpress/**/eth-sig-util": "yarn:@metamask/eth-sig-util@^5.1.0"
}
```
`eth-sig-util` is deprecated in favor of `@metamask/eth-sig-util`. The latter does not require `ethereumjs-abi` at all.

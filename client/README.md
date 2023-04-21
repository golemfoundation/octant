## Configuration

Ensure that the `.env`  file is present. See `.env.template`.

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

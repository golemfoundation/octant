import { graphql } from 'gql/gql';

export const ALLOCATED_FIELDS = graphql(`
  fragment AllocatedFields on Allocated {
    allocation
    blockTimestamp
    proposal
    user
  }
`);

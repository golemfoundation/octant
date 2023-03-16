import { gql } from '@apollo/client';

export const ALLOCATED_FIELDS = gql`
  fragment AllocatedFields on Allocated {
    allocation
    blockTimestamp
    proposal
    user
  }
`;

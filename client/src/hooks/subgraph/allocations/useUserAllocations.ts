import { gql, useQuery, QueryResult } from '@apollo/client';
import { useAccount } from 'wagmi';

import { ALLOCATED_FIELDS } from './fragments';
import { AllocationSquashed } from './types';
import { parseAllocations } from './utils';

type Variables = {
  userAddress: `0x${string}`;
};

const GET_USER_ALLOCATIONS = gql`
  ${ALLOCATED_FIELDS}
  query GetUserAllocations($userAddress: String!) {
    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      ...AllocatedFields
    }
  }
`;

export default function useUserAllocations(): QueryResult<AllocationSquashed[], Variables> {
  const { address } = useAccount();

  const { data, ...rest } = useQuery(GET_USER_ALLOCATIONS, {
    skip: !address,
    variables: {
      userAddress: address!,
    },
  });

  return {
    data: parseAllocations(data?.allocateds),
    ...rest,
  };
}

import { gql, useQuery, QueryResult } from '@apollo/client';

import useWallet from 'store/models/wallet/store';

import { ALLOCATED_FIELDS } from './fragments';
import { AllocationSquashed } from './types';
import { parseAllocations } from './utils';

type Variables = {
  userAddress: string;
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
  const {
    wallet: { address },
  } = useWallet();

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

import { gql, useQuery, QueryResult } from '@apollo/client';
import { useMetamask } from 'use-metamask';

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
    metaState: { account },
  } = useMetamask();
  const userAddress = account[0];

  const { data, ...rest } = useQuery(GET_USER_ALLOCATIONS, {
    skip: !userAddress,
    variables: {
      userAddress,
    },
  });

  return {
    data: parseAllocations(data?.allocateds),
    ...rest,
  };
}

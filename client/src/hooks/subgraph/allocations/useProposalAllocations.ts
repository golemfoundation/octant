import { gql, useQuery, QueryResult } from '@apollo/client';

import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';

import { ALLOCATED_FIELDS } from './fragments';
import { AllocationSquashed } from './types';
import { parseAllocations } from './utils';

type Variables = {
  blockTimestamp: number | undefined;
  proposalAddress: string | undefined;
};

/**
 * $blockTimestamp is set as optional because skip option is not respected,
 * causing query to be sent without it, resulting in an error.
 */
const GET_PROPOSAL_ALLOCATIONS = gql`
  ${ALLOCATED_FIELDS}
  query GetProposalAllocations($blockTimestamp: Int = 0, $proposalAddress: String!) {
    allocateds(
      orderBy: blockTimestamp
      where: { proposal: $proposalAddress, blockTimestamp_gte: $blockTimestamp }
    ) {
      ...AllocatedFields
    }
  }
`;

export default function useProposalAllocations({
  proposalAddress,
}: {
  proposalAddress?: string;
}): QueryResult<AllocationSquashed[], Variables> {
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();

  const { data, ...rest } = useQuery(GET_PROPOSAL_ALLOCATIONS, {
    skip: timeCurrentEpochStart === undefined || !proposalAddress,
    variables: {
      blockTimestamp: timeCurrentEpochStart ? timeCurrentEpochStart / 1000 : undefined,
      proposalAddress,
    },
  });

  const parsedAllocations = parseAllocations(data?.allocateds);

  // TODO OCT-312: potentially remove this util, otherwise extract & test.
  // From each user getting allocation with the highest timestsamp (newest).
  const filteredAllocation = parsedAllocations
    ? parsedAllocations.reduce<AllocationSquashed[]>((acc, curr) => {
        const alreadyAdded = acc.find(({ user }) => user === curr.user);
        if (alreadyAdded && curr.blockTimestamp > alreadyAdded.blockTimestamp) {
          const index = acc.indexOf(alreadyAdded);
          acc[index] = curr;
          return acc;
        }
        return [...acc, curr];
      }, [])
    : [];

  return {
    data: filteredAllocation,
    ...rest,
  };
}

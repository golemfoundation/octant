import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';

import { Allocation, AllocationSquashed } from './types';
import { parseAllocations } from './utils';

/**
 * $blockTimestamp is set as optional because skip option is not respected,
 * causing query to be sent without it, resulting in an error.
 */
const GET_PROPOSAL_ALLOCATIONS = graphql(`
  query GetProposalAllocations($blockTimestamp: Int = 0, $proposalAddress: Bytes!) {
    allocateds(
      orderBy: blockTimestamp
      where: { proposal: $proposalAddress, blockTimestamp_gte: $blockTimestamp }
    ) {
      ...AllocatedFields
    }
  }
`);

export default function useProposalAllocations({
  proposalAddress,
}: {
  proposalAddress?: string;
}): UseQueryResult<AllocationSquashed[]> {
  const { subgraphAddress } = env;
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();
  const { data, ...rest } = useQuery(
    QUERY_KEYS.proposalAllocations(proposalAddress!),
    async () =>
      request(subgraphAddress, GET_PROPOSAL_ALLOCATIONS, {
        blockTimestamp: timeCurrentEpochStart ? timeCurrentEpochStart / 1000 : undefined,
        proposalAddress,
      }),
    {
      enabled: !!timeCurrentEpochStart && !!proposalAddress,
    },
  );

  const parsedAllocations = parseAllocations(data?.allocateds as Allocation[]);

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

  // @ts-expect-error resolve typing issue.
  return {
    data: filteredAllocation,
    ...rest,
  };
}

import { useQueries } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetIndividualRewards, Response } from 'api/calls/individualRewards';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export default function useIndividualRewardAllEpochs({
  isEnabledAdditional,
}: {
  isEnabledAdditional?: boolean;
} = {}): { data: bigint[]; isFetching: boolean } {
  const { address } = useAccount();
  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();

  const individualRewardAllEpochs = useQueries({
    queries: [...Array(currentEpoch).keys()].map(epoch => ({
      enabled: !!address && currentEpoch !== undefined && currentEpoch > 1 && isEnabledAdditional,
      queryFn: () => {
        // For Epoch 0 and Epoch 1 error 400 is returned.
        if ([0, 1].includes(epoch)) {
          return new Promise<Response>(resolve => {
            resolve({ budget: '0' });
          });
        }
        return apiGetIndividualRewards(epoch, address!);
      },
      queryKey: QUERY_KEYS.individualReward(epoch),
      retry: false,
    })),
  });

  const isFetchingUserAllAllocations =
    !address ||
    isFetchingCurrentEpoch ||
    individualRewardAllEpochs.length === 0 ||
    individualRewardAllEpochs.some(({ isFetching }) => isFetching);

  if (isFetchingUserAllAllocations) {
    return {
      data: [],
      isFetching: isFetchingUserAllAllocations,
    };
  }

  return {
    data: individualRewardAllEpochs.map(({ data }) =>
      // Data is not available when options.enabled === false.
      parseUnitsBigInt(data ? data.budget : '', 'wei'),
    ),
    isFetching: false,
  };
}

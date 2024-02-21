import { useQueries } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetIndividualRewards, Response } from 'api/calls/individualRewards';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIndividualRewardAllEpochs(): { data: BigNumber[]; isFetching: boolean } {
  const { address } = useAccount();
  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();

  const individualRewardAllEpochs = useQueries({
    queries: [...Array(currentEpoch).keys()].map(epoch => ({
      enabled: !!address && currentEpoch !== undefined && currentEpoch > 1,
      queryFn: async () => {
        try {
          return await apiGetIndividualRewards(epoch, address!);
        } catch (error) {
          return new Promise<Response>(resolve => {
            resolve({ budget: '0' });
          });
        }
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
    data: individualRewardAllEpochs.map(({ data }) => parseUnits(data!.budget, 'wei')),
    isFetching: false,
  };
}

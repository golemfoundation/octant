import { UseQueryOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from './useEpochPatronsAllEpochs';
import useIndividualRewardAllEpochs from './useIndividualRewardAllEpochs';

export default function useTotalPatronDonations(options?: Omit<UseQueryOptions<any>, 'queryKey'>): {
  data: { numberOfEpochs: number, value: bigint; } | undefined;
  isFetching: boolean;
} {
  const { address } = useAccount();

  const { data: individualRewardAllEpochs, isFetching: isFetchingIndividualReward } =
    useIndividualRewardAllEpochs(options);
  const { data: epochPatronsAllEpochs, isFetching: isFetchingEpochPatronsAllEpochs } =
    useEpochPatronsAllEpochs(options);

  const isFetching = isFetchingIndividualReward || isFetchingEpochPatronsAllEpochs;

  if (isFetching) {
    return {
      data: undefined,
      isFetching,
    };
  }

  return {
    data: epochPatronsAllEpochs.reduce(
      (acc, curr, currentIndex) => {
        return curr.includes(address!)
          ? {
              numberOfEpochs: acc.numberOfEpochs + 1,
              value: acc.value + individualRewardAllEpochs[currentIndex],
            }
          : acc;
      },
      { numberOfEpochs: 0, value: BigInt(0) },
    ),
    isFetching: false,
  };
}

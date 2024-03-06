import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from './useEpochPatronsAllEpochs';
import useIndividualRewardAllEpochs from './useIndividualRewardAllEpochs';

export default function useTotalPatronDonations({
  isEnabledAdditional,
}: {
  isEnabledAdditional?: boolean;
} = {}): {
  data: { numberOfEpochs: number; value: bigint } | undefined;
  isFetching: boolean;
} {
  const { address } = useAccount();

  const { data: individualRewardAllEpochs, isFetching: isFetchingIndividualReward } =
    useIndividualRewardAllEpochs({ isEnabledAdditional });
  const { data: epochPatronsAllEpochs, isFetching: isFetchingEpochPatronsAllEpochs } =
    useEpochPatronsAllEpochs({ isEnabledAdditional });

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

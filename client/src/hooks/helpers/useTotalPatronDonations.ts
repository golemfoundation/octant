import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from './useEpochPatronsAllEpochs';
import useIndividualRewardAllEpochs from './useIndividualRewardAllEpochs';

export default function useTotalPatronDonations({
  isEnabledAdditional,
}: {
  isEnabledAdditional: boolean;
}): {
  data: bigint | undefined;
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
      (acc, curr, currentIndex) =>
        curr.includes(address!) ? acc + individualRewardAllEpochs[currentIndex] : acc,
      BigInt(0),
    ),
    isFetching: false,
  };
}

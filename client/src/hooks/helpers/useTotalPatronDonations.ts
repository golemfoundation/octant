import { UseQueryOptions } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from './useEpochPatronsAllEpochs';
import useIndividualRewardAllEpochs from './useIndividualRewardAllEpochs';

export default function useTotalPatronDonations(options?: Omit<UseQueryOptions<any>, 'queryKey'>): {
  data: BigNumber | undefined;
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
      (acc, curr, currentIndex) =>
        curr.includes(address!) ? acc.add(individualRewardAllEpochs[currentIndex]) : acc,
      BigNumber.from(0),
    ),
    isFetching: false,
  };
}

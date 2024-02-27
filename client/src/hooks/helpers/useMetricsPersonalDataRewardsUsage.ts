import { useAccount } from 'wagmi';

import useTotalWithdrawals from 'hooks/subgraph/useTotalWithdrawals';

import useEpochPatronsAllEpochs from './useEpochPatronsAllEpochs';
import useIndividualRewardAllEpochs from './useIndividualRewardAllEpochs';
import useUserAllocationsAllEpochs from './useUserAllocationsAllEpochs';

export default function useMetricsPersonalDataRewardsUsage(): {
  data:
    | {
        totalDonations: bigint;
        totalRewardsUsed: bigint;
        totalWithdrawals: bigint;
      }
    | undefined;
  isFetching: boolean;
} {
  const { address } = useAccount();
  const { data: individualRewardAllEpochs, isFetching: isFetchingIndividualReward } =
    useIndividualRewardAllEpochs();
  const { data: userAllocationsAllEpochs, isFetching: isFetchingUserAllAllocations } =
    useUserAllocationsAllEpochs();
  const { data: epochPatronsAllEpochs, isFetching: isFetchingEpochPatronsAllEpochs } =
    useEpochPatronsAllEpochs();
  const { data: totalWithdrawals, isFetching: isFetchingTotalWithdrawals } = useTotalWithdrawals();

  const isFetching =
    isFetchingIndividualReward ||
    isFetchingUserAllAllocations ||
    isFetchingEpochPatronsAllEpochs ||
    isFetchingTotalWithdrawals;

  if (isFetching) {
    return {
      data: undefined,
      isFetching,
    };
  }

  // We count only rewards from epochs user did an action -- allocation or was a patron.
  const totalRewardsUsed = individualRewardAllEpochs.reduce((acc, curr, currentIndex) => {
    const hasUserAlreadyDoneAllocationInGivenEpoch =
      userAllocationsAllEpochs[currentIndex].hasUserAlreadyDoneAllocation;
    const wasPatronInGivenEpoch = epochPatronsAllEpochs[currentIndex].includes(address as string);
    const wasBudgetEffective = hasUserAlreadyDoneAllocationInGivenEpoch || wasPatronInGivenEpoch;

    return wasBudgetEffective ? acc + curr : acc;
  }, BigInt(0));
  const totalDonations = userAllocationsAllEpochs.reduce((acc, curr, currentIndex) => {
    const givenEpochIndividualReward = individualRewardAllEpochs[currentIndex];
    const wasPatronInGivenEpoch = epochPatronsAllEpochs[currentIndex].includes(address as string);
    if (curr.hasUserAlreadyDoneAllocation) {
      const userAllocationsSum = curr.elements.reduce(
        (acc2, curr2) => acc2 + curr2.value,
        BigInt(0),
      );
      return acc + userAllocationsSum;
    }
    if (wasPatronInGivenEpoch) {
      return acc + givenEpochIndividualReward;
    }
    return acc;
  }, BigInt(0));

  return {
    data: {
      totalDonations,
      totalRewardsUsed,
      totalWithdrawals: totalWithdrawals || BigInt(0),
    },
    isFetching: false,
  };
}

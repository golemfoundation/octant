import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';

export default function useAllocationViewSetRewardsForProposals(): {
  isRewardsForProposalsSet: boolean;
} {
  const [isRewardsForProposalsSet, setIsRewardsForProposalsSet] = useState<boolean>(false);
  const { setRewardsForProposals } = useAllocationsStore(state => ({
    setRewardsForProposals: state.setRewardsForProposals,
  }));

  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations(
    undefined,
    { refetchOnMount: true },
  );
  const { isConnected } = useAccount();

  useEffect(() => {
    /**
     * This hook adds rewardsForProposals to the store.
     * It needs to be used in AllocationView,
     * since user can change rewardsForProposals and leave the view.
     * When they reenter it, they need to see their latest allocation locked in the slider.
     */
    if (!isConnected) {
      setIsRewardsForProposalsSet(true);
    }
    if (isFetchingIndividualReward || isFetchingCurrentEpoch || isFetchingUserAllocations) {
      return;
    }
    if (!currentEpoch || (!userAllocations && currentEpoch > 1)) {
      return;
    }

    const localStorageRewardsForProposals = BigInt(
      JSON.parse(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROPOSALS) || '0'),
    );
    if (userAllocations && userAllocations.elements.length > 0) {
      const userAllocationsSum = userAllocations.elements.reduce(
        (acc, curr) => acc + curr.value,
        BigInt(0),
      );
      setRewardsForProposals(userAllocationsSum);
    } else if (
      userAllocations &&
      userAllocations.elements.length === 0 &&
      userAllocations.hasUserAlreadyDoneAllocation
    ) {
      setRewardsForProposals(BigInt(0));
    } else {
      setRewardsForProposals(
        !individualReward ||
          localStorageRewardsForProposals < BigInt(0) ||
          localStorageRewardsForProposals > individualReward
          ? BigInt(0)
          : localStorageRewardsForProposals,
      );
    }
    setIsRewardsForProposalsSet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentEpoch,
    isFetchingIndividualReward,
    isFetchingCurrentEpoch,
    isFetchingUserAllocations,
    isConnected,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    individualReward,
    userAllocations?.elements.length,
  ]);

  return { isRewardsForProposalsSet };
}

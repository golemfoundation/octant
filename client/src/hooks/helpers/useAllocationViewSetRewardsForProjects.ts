import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ALLOCATION_REWARDS_FOR_PROJECTS } from 'constants/localStorageKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';

export default function useAllocationViewSetRewardsForProjects(): {
  isRewardsForProjectsSet: boolean;
} {
  const [isRewardsForProjectsSet, setIsRewardsForProjectsSet] = useState<boolean>(false);
  const { setRewardsForProjects } = useAllocationsStore(state => ({
    setRewardsForProjects: state.setRewardsForProjects,
  }));

  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations(
    undefined,
    { refetchOnMount: true },
  );
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { isConnected } = useAccount();

  useEffect(() => {
    /**
     * This hook adds rewardsForProjects to the store.
     * It needs to be used in AllocationView,
     * since user can change rewardsForProjects and leave the view.
     * When they reenter it, they need to see their latest allocation locked in the slider.
     */
    if (!isConnected) {
      setIsRewardsForProjectsSet(true);
    }
    if (isFetchingIndividualReward || isFetchingCurrentEpoch || isFetchingUserAllocations) {
      return;
    }
    if (!currentEpoch || (!userAllocations && currentEpoch > 1)) {
      return;
    }

    const localStorageRewardsForProjects = BigInt(
      JSON.parse(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROJECTS) || '0'),
    );
    if (isDecisionWindowOpen && userAllocations && userAllocations.elements.length > 0) {
      const userAllocationsSum = userAllocations.elements.reduce(
        (acc, curr) => acc + curr.value,
        BigInt(0),
      );
      setRewardsForProjects(userAllocationsSum);
    } else if (
      userAllocations &&
      userAllocations.elements.length === 0 &&
      userAllocations.hasUserAlreadyDoneAllocation
    ) {
      setRewardsForProjects(BigInt(0));
    } else if (!isDecisionWindowOpen) {
      setRewardsForProjects(BigInt(0));
    } else {
      setRewardsForProjects(
        !individualReward ||
          localStorageRewardsForProjects < BigInt(0) ||
          localStorageRewardsForProjects > individualReward
          ? BigInt(0)
          : localStorageRewardsForProjects,
      );
    }
    setIsRewardsForProjectsSet(true);
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

  return { isRewardsForProjectsSet };
}

import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
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

  const { data: individualReward } = useIndividualReward();
  const { data: userAllocations } = useUserAllocations(undefined, { refetchOnMount: true });
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
    if (!individualReward || !userAllocations) {
      return;
    }

    const localStorageRewardsForProposals = BigNumber.from(
      JSON.parse(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROPOSALS) || 'null'),
    );
    if (userAllocations.elements.length > 0) {
      const userAllocationsSum = userAllocations.elements.reduce(
        (acc, curr) => acc.add(curr.value),
        BigNumber.from(0),
      );
      setRewardsForProposals(userAllocationsSum);
    } else {
      setRewardsForProposals(
        localStorageRewardsForProposals.lt(BigNumber.from(0)) ||
          localStorageRewardsForProposals.gt(individualReward)
          ? BigNumber.from(0)
          : localStorageRewardsForProposals,
      );
    }
    setIsRewardsForProposalsSet(true);
    // .toHexString(), because React can't compare objects as deps in hooks, causing infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, individualReward?.toHexString(), userAllocations?.elements.length]);

  return { isRewardsForProposalsSet };
}

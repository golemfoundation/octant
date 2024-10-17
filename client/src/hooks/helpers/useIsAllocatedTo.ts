import { useMemo } from 'react';

import { Response } from 'hooks/queries/useUserAllocations';

export default function useIsAllocatedTo(
  address: string,
  allocations: string[],
  epoch: number,
  isDecisionWindowOpen: boolean,
  userAllocations: Response | undefined,
): boolean {
  return useMemo(() => {
    const isInUserAllocations = !!userAllocations?.elements.find(
      ({ address: userAllocationAddress }) => userAllocationAddress === address,
    );
    const isInAllocations = allocations.includes(address);
    if (epoch !== undefined) {
      return isInUserAllocations;
    }
    if (isDecisionWindowOpen) {
      return isInUserAllocations && isInAllocations;
    }
    return false;
  }, [address, allocations, userAllocations, epoch, isDecisionWindowOpen]);
}

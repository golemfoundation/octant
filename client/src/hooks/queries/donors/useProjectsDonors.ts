import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochAllocations from 'hooks/queries/useEpochAllocations';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import { ProjectDonor } from './types';

export default function useProjectsDonors(epoch?: number): {
  data: { [key: string]: ProjectDonor[] };
  isFetching: boolean;
  isSuccess: boolean;
  refetch: () => void;
} {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const epochToUse = epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!);

  const {
    data: epochAllocations,
    refetch,
    isFetching: isFetchingEpochAllocations,
    isSuccess,
  } = useEpochAllocations(epochToUse);

  const projectsDonors =
    epochAllocations?.reduce((acc, curr) => {
      if (!acc[curr.project]) {
        acc[curr.project] = [];
      }

      acc[curr.project].push({ address: curr.donor, amount: curr.amount });
      acc[curr.project].sort((a, b) => {
        if (a.amount > b.amount) {
          return -1;
        }
        if (a.amount < b.amount) {
          return 1;
        }
        return 0;
      });

      return acc;
    }, {}) || {};

  const isFetching =
    currentEpoch === undefined || isDecisionWindowOpen === undefined || isFetchingEpochAllocations;

  return {
    data: projectsDonors,
    isFetching,
    // Ensures projectsDonorsResults is actually fetched with data, and not just an object with undefined values.
    isSuccess,
    refetch,
  };
}

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochAllocations from 'hooks/queries/useEpochAllocations';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { WebsocketListenEvent } from 'types/websocketEvents';

import { mapDataToProjectDonors } from './utils';

export default function useProjectsDonors(epoch?: number): UseQueryResult<{
  [projectAddress: string]: {
    address: string;
    amount: bigint;
  }[];
}> {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const queryClient = useQueryClient();
  const epochToUse = epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!);

  const {
    data: epochAllocations,
    isFetching: isFetchingEpochAllocations,
    isSuccess,
  } = useEpochAllocations(epochToUse, {
    enabled: isDecisionWindowOpen === true || epoch !== undefined,
  });

  useSubscription<{ donors: { address: string; amount: string }[]; project: string }>({
    callback: data => {
      const prevData = {
        ...(queryClient.getQueryData(QUERY_KEYS.projectsDonors(currentEpoch! - 1)) as {}),
      };

      queryClient.setQueryData(QUERY_KEYS.projectsDonors(currentEpoch! - 1), {
        ...prevData,
        [data.project]: mapDataToProjectDonors(data.donors),
      });
    },
    enabled: isDecisionWindowOpen,
    event: WebsocketListenEvent.projectDonors,
  });

  const projectsDonorsQuery = useQuery({
    enabled: isSuccess,
    queryFn: () => {
      return (
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
        }, {}) || {}
      );
    },
    queryKey: QUERY_KEYS.projectsDonors(epochToUse),
  });

  const isFetching =
    currentEpoch === undefined || isDecisionWindowOpen === undefined || isFetchingEpochAllocations;

  return {
    ...projectsDonorsQuery,
    isFetching,
  };
}

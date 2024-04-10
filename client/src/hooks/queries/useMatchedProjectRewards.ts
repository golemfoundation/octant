import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  apiGetMatchedProjectRewards,
  apiGetEstimatedMatchedProjectRewards,
  Response as ApiResponse,
} from 'api/calls/rewards';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

type Response = ApiResponse;

export type ProjectRewards = {
  address: string;
  allocated: bigint;
  matched: bigint;
  percentage: number;
  sum: bigint;
};

function parseResponse(response: Response): ProjectRewards[] {
  const totalDonations = response?.rewards.reduce(
    (acc, { allocated, matched }) =>
      acc + parseUnitsBigInt(allocated, 'wei') + parseUnitsBigInt(matched, 'wei'),
    BigInt(0),
  );
  return response?.rewards.map(({ address, allocated, matched }) => {
    const allocatedBigNum = parseUnitsBigInt(allocated, 'wei');
    const matchedBigNum = parseUnitsBigInt(matched, 'wei');

    const sum = allocatedBigNum + matchedBigNum;
    const percentage =
      totalDonations !== 0n && sum !== 0n ? Number((sum * 100n) / totalDonations!) : 0;
    return {
      address,
      allocated: allocatedBigNum,
      matched: matchedBigNum,
      percentage,
      sum,
    };
  });
}

export default function useMatchedProjectRewards(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProjectRewards[], any>,
): UseQueryResult<ProjectRewards[], unknown> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  useSubscription<Response['rewards']>({
    callback: data => {
      queryClient.setQueryData(
        QUERY_KEYS.matchedProjectRewards(
          epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        ),
        {
          rewards: data,
        },
      );
    },
    enabled: epoch === undefined,
    event: WebsocketListenEvent.projectRewards,
  });

  return useQuery({
    enabled:
      isDecisionWindowOpen !== undefined &&
      ((epoch !== undefined && epoch > 0) || (!!currentEpoch && currentEpoch > 1)),
    queryFn: () => {
      if (!isDecisionWindowOpen && epoch) {
        return apiGetMatchedProjectRewards(epoch);
      }
      if (isDecisionWindowOpen) {
        return apiGetEstimatedMatchedProjectRewards();
      }
      /**
       * During currentEpoch and outside allocation window projects do not have matchedProjectRewards.
       * Because hook is called anyway, hence the empty promise.
       */
      // eslint-disable-next-line no-promise-executor-return
      return new Promise<ApiResponse>(resolve => resolve({ rewards: [] }));
    },
    queryKey: QUERY_KEYS.matchedProjectRewards(
      epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
    ),
    select: response => parseResponse(response),
    ...options,
  });
}

import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import {
  apiGetMatchedProposalRewards,
  apiGetEstimatedMatchedProposalRewards,
  Response as ApiResponse,
} from 'api/calls/rewards';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

type Response = ApiResponse;

export type ProposalRewards = {
  address: string;
  allocated: BigNumber;
  matched: BigNumber;
  percentage: number;
  sum: BigNumber;
};

function parseResponse(response: Response): ProposalRewards[] {
  const totalDonations = response?.rewards.reduce(
    (acc, { allocated, matched }) =>
      acc.add(parseUnits(allocated, 'wei')).add(parseUnits(matched, 'wei')),
    BigNumber.from(0),
  );
  return response?.rewards.map(({ address, allocated, matched }) => {
    const allocatedBigNum = parseUnits(allocated, 'wei');
    const matchedBigNum = parseUnits(matched, 'wei');

    const sum = allocatedBigNum.add(matchedBigNum);
    const percentage =
      !totalDonations!.isZero() && !sum.isZero() ? sum.mul(100).div(totalDonations!).toNumber() : 0;
    return {
      address,
      allocated: allocatedBigNum,
      matched: matchedBigNum,
      percentage,
      sum,
    };
  });
}

export default function useMatchedProposalRewards(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalRewards[], any>,
): UseQueryResult<ProposalRewards[]> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  useSubscription<Response['rewards']>({
    callback: data => {
      queryClient.setQueryData(QUERY_KEYS.matchedProposalRewards(currentEpoch! - 1), {
        rewards: data,
      });
    },
    enabled: epoch === undefined,
    event: WebsocketListenEvent.proposalRewards,
  });

  return useQuery(
    QUERY_KEYS.matchedProposalRewards(epoch || currentEpoch! - 1),
    () => (epoch ? apiGetMatchedProposalRewards(epoch) : apiGetEstimatedMatchedProposalRewards()),
    {
      enabled:
        (epoch !== undefined && epoch > 0) ||
        (!!currentEpoch && currentEpoch > 1 && isDecisionWindowOpen),
      select: response => parseResponse(response),
      ...options,
    },
  );
}

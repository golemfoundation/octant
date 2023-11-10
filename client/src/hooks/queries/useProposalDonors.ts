import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetProposalDonors, Response } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

import useCurrentEpoch from './useCurrentEpoch';

type ProposalDonors = {
  address: string;
  amount: BigNumber;
}[];

const mapDataToProposalDonors = (data: Response): ProposalDonors =>
  data
    .map(({ address, amount }) => ({
      address,
      amount: parseUnits(amount, 'wei'),
    }))
    .sort((a, b) => {
      if (a.amount.gt(b.amount)) {
        return 1;
      }
      if (a.amount.lt(b.amount)) {
        return -1;
      }
      return 0;
    });

export default function useProposalDonors(
  proposalAddress: string,
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalDonors, any>,
): UseQueryResult<ProposalDonors> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();

  /**
   * Socket returns proposal donors for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  useSubscription<Response>(WebsocketListenEvent.proposalDonors, data => {
    // eslint-disable-next-line chai-friendly/no-unused-expressions
    epoch
      ? null
      : queryClient.setQueryData(
          QUERY_KEYS.proposalDonors(proposalAddress, currentEpoch! - 1),
          data,
        );
  });

  return useQuery(
    QUERY_KEYS.proposalDonors(proposalAddress, epoch || currentEpoch! - 1),
    () => apiGetProposalDonors(proposalAddress, epoch || currentEpoch! - 1),
    {
      enabled: !!proposalAddress && (epoch !== undefined || !!(currentEpoch && currentEpoch > 1)),
      select: response => mapDataToProposalDonors(response),
      staleTime: Infinity,
      ...options,
    },
  );
}

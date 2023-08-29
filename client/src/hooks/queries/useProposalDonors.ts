import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

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
  data.map(({ address, amount }) => ({
    address,
    amount: parseUnits(amount),
  }));

export default function useProposalDonors(
  proposalAddress: string,
  options?: UseQueryOptions<Response, unknown, ProposalDonors, any>,
): UseQueryResult<ProposalDonors> {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  useSubscription<Response>(WebsocketListenEvent.proposalDonors, data => {
    const updatedProposalDonors: ProposalDonors = mapDataToProposalDonors(data);

    queryClient.setQueryData(QUERY_KEYS.proposalDonors(proposalAddress), updatedProposalDonors);
  });

  return useQuery(
    QUERY_KEYS.proposalDonors(proposalAddress),
    () => apiGetProposalDonors(proposalAddress, currentEpoch! - 1),
    {
      enabled: !!currentEpoch && !!address && !!proposalAddress && currentEpoch > 1,
      select: response => mapDataToProposalDonors(response),
      staleTime: Infinity,
      ...options,
    },
  );
}

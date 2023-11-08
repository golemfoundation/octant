import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetProposalDonors, Response } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

type ProposalDonors = {
  address: string;
  amount: BigNumber;
}[];

const mapDataToProposalDonors = (data: Response): ProposalDonors =>
  data.map(({ address, amount }) => ({
    address,
    amount: parseUnits(amount, 'wei'),
  }));

export default function useProposalDonors(
  proposalAddress: string,
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalDonors, any>,
): UseQueryResult<ProposalDonors> {
  const { data: currentEpoch } = useCurrentEpoch();

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

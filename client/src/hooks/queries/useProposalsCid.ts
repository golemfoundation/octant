import { UseQueryResult, useQuery } from 'react-query';

import useContractProposals from 'hooks/contracts/useContractProposals';

export default function useProposalsCid(): UseQueryResult<string> {
  const contractProposals = useContractProposals();

  return useQuery(['proposalsCid'], () => contractProposals?.cid(), {
    enabled: !!contractProposals,
  });
}

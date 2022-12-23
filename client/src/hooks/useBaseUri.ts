import { UseQueryResult, useQuery } from 'react-query';

import useContractProposals from './contracts/useContractProposals';

export default function useBaseUri(): UseQueryResult<string> {
  const contractProposals = useContractProposals();

  return useQuery(['baseUri'], () => contractProposals?.baseURI(), {
    enabled: !!contractProposals,
  });
}

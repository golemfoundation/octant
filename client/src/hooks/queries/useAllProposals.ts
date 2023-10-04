import { useQueries } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractProposals } from 'hooks/contracts/readContracts';

export default function useAllProposals(): {
  data: string[];
  isFetching: boolean;
} {
  /**
   * TODO OCT-949 OCT-955:
   * Adjust this hook. Either fetch from IPFS directly (see git history, revert commit introducing this hook),
   * or from backend endpoint.
   */
  const publicClient = usePublicClient();

  const proposalsEpochs = useQueries({
    /**
     * TODO OCT-949 OCT-955 fetch from first two epochs only to not choke testnet app,
     * where we have hundreds of epochs.
     */
    queries: [1, 2].map(epochNumber => ({
      queryFn: () =>
        readContractProposals({
          args: [epochNumber],
          functionName: 'getProposalAddresses',
          publicClient,
        }),
      queryKey: QUERY_KEYS.proposalsContract(epochNumber),
    })),
  });

  const isProposalsEpochsFetching =
    proposalsEpochs.length === 0 || proposalsEpochs.some(({ isFetching }) => isFetching);

  if (isProposalsEpochsFetching) {
    return {
      data: [],
      isFetching: isProposalsEpochsFetching,
    };
  }

  const data = proposalsEpochs.reduce<string[]>((acc, curr) => [...acc, ...curr.data], []);

  return {
    data: [...new Set(data)],
    isFetching: false,
  };
}

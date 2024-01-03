import { useAccount } from 'wagmi';

import useAllProposals from 'hooks/subgraph/useAllProposals';

const useIsProjectAdminMode = (): boolean => {
  const { isConnected, address } = useAccount();
  const { data: allProposals } = useAllProposals();

  return isConnected && !!allProposals?.includes(address as `0x${string}`);
};

export default useIsProjectAdminMode;
